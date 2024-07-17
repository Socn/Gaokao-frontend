<script setup lang="ts">
import { ElButton } from 'element-plus'
import xlsx from 'node-xlsx'
import studentAPI from '../../api/modules/student'
import { StudentC } from '@/interfaces/student'

const funcs = defineProps<{
  close: Function
}>()

const fileInput = ref<HTMLInputElement>()
const buttonDisabled = ref<boolean>(true)
const workbook = ref<Array<{ name: string, data: any[][] }>>()
const err = ref<Array<boolean>>([])
const studentList = ref<Array<Array<StudentC>>>([])
const selection = ref<Array<boolean>>([])

const props = ['name', 'id', 'chinese', 'math', 'english', 'physics', 'history', 'chemistry', 'biology', 'politics', 'geography']
const fields = ['姓名', '学号', '语文', '数学', '英语', '物理', '历史', '化学', '生物', '政治', '地理']

const activeTable = ref()

const propToIndex: Array<Map<string, number>> = []
const indexToProp: Array<Map<number, string>> = []

onMounted(() => {
  fileInput.value?.addEventListener('change', () => {
    buttonDisabled.value = fileInput.value?.files?.length === 0
  })
})

async function handleConfirmFile() {
  if (fileInput.value === undefined || fileInput.value === null) return
  if (fileInput.value.files === undefined || fileInput.value.files === null) return
  const data = await fileInput.value.files[0].arrayBuffer()
  workbook.value = xlsx.parse(data)
  workbook.value.forEach((v, table) => {
    if (propToIndex[table] === undefined)propToIndex[table] = new Map<string, number>()
    if (indexToProp[table] === undefined)indexToProp[table] = new Map<number, string>()
    propToIndex[table].clear()
    indexToProp[table].clear()
    v.data[0].forEach((prop, index) => {
      if ((fields.find(v => v === prop)) === undefined) {
        err.value[index] = true
        return
      }
      propToIndex[table].set(prop, index)
      indexToProp[table].set(index, props[fields.findIndex(v => v === prop)])
    })
    v.data.splice(0, 1)
    for (const stu of v.data) {
      const stuAPI = stu.reduce((prev, currv, index) => {
        return {
          ...prev,
          [indexToProp[table].get(index) ?? currv]:
            (indexToProp[table].get(index) === 'name' || indexToProp[table].get(index) === 'id')
              ? String(currv)
              : currv,
        }
      },
      {})
      if (studentList.value[table] === undefined)studentList.value[table] = new Array<StudentC>()
      studentList.value[table].push(new StudentC(stuAPI))
    }
  })
}

function countSelection() {
  let ret = 0
  selection.value.forEach((v, index) => {
    ret += studentList.value[index].length * Number(v)
  })
  return ret
}

let importQueue = new Array<StudentC>()
let errorQueue = new Array<StudentC>()
const taskState = ref<'waiting' | 'progressing' | 'success' | 'error' | 'retrying' | 'retryError'>('waiting')
const taskSuccess = ref<number>(0)
const taskFailed = ref<number>(0)
const taskCount = ref<number>(0)
const taskMessage = ref<Array<string>>([])

const maxConcurrency = 10

function confirmImport() {
  importQueue = new Array<StudentC>()
  errorQueue = new Array<StudentC>()
  taskSuccess.value = 0
  taskFailed.value = 0
  taskCount.value = countSelection()
  taskMessage.value = []
  selection.value.forEach((selected, tableIndex) => {
    if (selected) {
      studentList.value[tableIndex].forEach((value) => {
        importQueue.push(value)
      })
    }
  })
  taskState.value = 'progressing'
  startImportQueue()
}
const retryProgress = ref<number>(0)
const retryCount = ref<number>(0)
async function _next(queue: Array<any>, index: number, currItem: StudentC, maxIndex: number, response: any, error: any, func: Function, errorCatch: Function, finallyFunc: Function) {
  if (response === undefined && error === undefined) {
    finallyFunc()
    const nextIndex = index + maxConcurrency
    if (nextIndex >= maxIndex) return
    const nextItem = queue[index + maxConcurrency]
    studentAPI.addGrade(nextItem)
      .then(response => _next(queue, nextIndex, nextItem, maxIndex, response, undefined, func, errorCatch, finallyFunc))
      .catch(error => _next(queue, nextIndex, nextItem, maxIndex, undefined, error, func, errorCatch, finallyFunc))
      .finally(() => _next(queue, nextIndex, nextItem, maxIndex, undefined, undefined, func, errorCatch, finallyFunc))
  }
  else {
    if (response !== undefined)func(response, currItem)
    if (error !== undefined)errorCatch(error, currItem)
  }
}
function thenFunc(response: any, item: StudentC) {
  if (response.success === true) {
    taskSuccess.value++
  }
  else {
    taskFailed.value++
    if (response.message.includes('Duplicate entry'))taskMessage.value.push(`学号发生重复:${item.id}`)
    else taskMessage.value.push(response.message)
    errorQueue.push(item)
  }
}
function catchFunc(error: any, item: StudentC) {
  taskFailed.value++
  taskMessage.value.push(error.message)
  errorQueue.push(item)
}
function finalFunc() {
  if (taskSuccess.value + taskFailed.value === taskCount.value) {
    if (taskFailed.value === 0)taskState.value = 'success'
    else taskState.value = 'error'
    retryCount.value = taskFailed.value
  }
}
function startImportQueue() {
  let i = 0
  while (i < maxConcurrency) {
    const currIndex = i
    if (currIndex >= taskCount.value) return
    const currItem = importQueue[i]
    studentAPI.addGrade(currItem)
      .then(response => _next(importQueue, currIndex, currItem, taskCount.value, response, undefined, thenFunc, catchFunc, finalFunc))
      .catch(error => _next(importQueue, currIndex, currItem, taskCount.value, undefined, error, thenFunc, catchFunc, finalFunc))
      .finally(() => _next(importQueue, currIndex, currItem, taskCount.value, undefined, undefined, thenFunc, catchFunc, finalFunc))
    i++
  }
}

let tempQueue = new Array<StudentC>()
let count = 0
function retryThenFunc(response: any, item: StudentC) {
  retryProgress.value++
  if (response.success === true) {
    taskSuccess.value++
    taskFailed.value--
  }
  else {
    if (response.message.includes('Duplicate entry'))taskMessage.value.push(`学号发生重复:${item.id}`)
    else taskMessage.value.push(response.message)
    tempQueue.push(item)
  }
}
function retryCatchFunc(error: any, item: StudentC) {
  taskMessage.value.push(error.message)
  tempQueue.push(item)
}
function retryFinalFunc() {
  if (retryProgress.value === count) {
    if (taskFailed.value === 0)taskState.value = 'success'
    else taskState.value = 'retryError'

    errorQueue = tempQueue
  }
}
function retryImport() {
  retryProgress.value = 0
  taskState.value = 'retrying'
  taskMessage.value = []
  tempQueue = new Array<StudentC>()
  count = errorQueue.length
  let i = 0
  while (i < maxConcurrency) {
    const currIndex = i
    if (currIndex >= errorQueue.length) return
    const currItem = errorQueue[i]
    studentAPI.addGrade(currItem)
      .then(response => _next(errorQueue, currIndex, currItem, errorQueue.length, response, undefined, retryThenFunc, retryCatchFunc, retryFinalFunc))
      .catch(error => _next(errorQueue, currIndex, currItem, errorQueue.length, undefined, error, retryThenFunc, retryCatchFunc, retryFinalFunc))
      .finally(() => _next(errorQueue, currIndex, currItem, errorQueue.length, undefined, undefined, retryThenFunc, retryCatchFunc, retryFinalFunc))
    i++
  }
  // while (i < count) {
  //   const curr = errorQueue[i]
  //   studentAPI.addGrade(curr).then((response) => {
  //     retryProgress.value++
  //     if (response.success === true) {
  //       taskSuccess.value++
  //       taskFailed.value--
  //     }
  //     else {
  //       taskMessage.value.push(response.message)
  //       tempQueue.push(curr)
  //     }
  //     if (retryProgress.value === count) {
  //       if (taskFailed.value === 0)taskState.value = 'success'
  //       else taskState.value = 'retryError'

  //       errorQueue = tempQueue
  //     }
  //   })
  //   i++
  // }
}

function formatProgressBar() {
  return `共${taskCount.value}条 / 已完成${taskSuccess.value} / 失败${taskFailed.value}`
}
function getPercentage() {
  if (taskState.value === 'progressing' || taskState.value === 'error' || taskState.value === 'success') {
    return Math.ceil((taskSuccess.value) / taskCount.value * 100)
  }
  if (taskState.value === 'retrying' || taskState.value === 'retryError') {
    return Math.ceil((taskSuccess.value) / taskCount.value * 100)
  }
}

defineExpose({
  countSelection,
  confirmImport,
})
</script>

<template>
  <div>
    <div style=" display: flex; flex-direction: row; align-items: center;height: 32px;">
      <input
        ref="fileInput" type="file" accept=".xls, .xlsx, application/msexcel"
      >
      <ElButton style="height: 32px;" type="primary" :disabled="buttonDisabled" @click="handleConfirmFile">
        确定
      </ElButton>
    </div>
    <el-divider v-if="workbook !== null && workbook !== undefined" />
    <span v-if="workbook !== null && workbook !== undefined" color="black" style=" margin-right: 12px;font-size: var(--el-font-size-large); line-height: 32px;">
      表格预览
    </span>
    <div v-if="workbook !== null && workbook !== undefined">
      <el-tabs
        v-model="activeTable"
        type="card"
        class="excel-tabs"
      >
        <el-tab-pane v-for="(table, index) in workbook" :key="table.name" :label="table.name">
          <div v-if="err[index]">
            <span>读取表格错误，可能由于表格格式错误或表头错误</span>
          </div>
          <el-checkbox v-if="!err[index]" v-model="selection[index]" label="是否导入此表格成绩" />
          <GradeTable
            v-if="!err[index]"
            :data="studentList[index]" :loading="false" max-table-height="400" :stripe="false"
          />
          <div style="display: felx;flex-direction: column;width: 100%; margin-top: 12px;">
            <el-progress
              v-if="taskState !== 'waiting'"
              :percentage="getPercentage()"
              :stroke-width="20"
              style="width: 100%;"
              :status="taskFailed === 0 ? 'success' : 'exception'"
            >
              <span style="font-size: var(--el-font-size-small);">{{ formatProgressBar() }}</span>
            </el-progress>
            <div style="display: flex; justify-content: flex-end;width: 100%; margin-top: 8px;">
              <ElButton v-if="taskState === 'waiting'" style="margin-left: auto;" @click="() => funcs.close(false)">
                取消
              </ElButton>
              <ElButton v-if="taskState === 'waiting'" type="primary" style="margin-left: 8px;" :disabled="countSelection() === 0" @click="confirmImport">
                确定导入 {{ countSelection() }} 条成绩
              </ElButton>

              <ElButton v-if="taskState === 'success'" type="success" style="margin-left: 16px;" @click="() => funcs.close(true)">
                导入完成
              </ElButton>

              <el-tooltip
                v-if="taskState === 'error' || taskState === 'retryError'"
                class="box-item"
                effect="dark"
                :content="taskMessage.toString()"
                placement="top"
              >
                <ElButton type="danger" style="margin-left: 16px;" plain>
                  导入发生错误
                </ElButton>
              </el-tooltip>
              <ElButton v-if="taskState === 'error' || taskState === 'retryError'" type="danger" style="margin-left: 8px;" @click="retryImport">
                重试
              </ElButton>
            </div>
          </div>
          <!-- <el-table :data="table.data" max-height="800px">
            <el-table-column label="序号">
              <template #default="scope">
                {{ scope.$index + 1 }}
              </template>
            </el-table-column>
            <el-table-column v-for="prop in fields" :key="prop" :label="prop">
              <template #default="scope">
                {{ scope.row[propToIndex[index].get(prop) ?? 0] }}
              </template>
            </el-table-column>
          </el-table> -->
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- {{ readTextFile("file://D:/amfs/ICF1") }} -->
  </div>
</template>

<style>
.excel-tabs .el-tabs__header {
  margin-bottom: 0;
}
</style>
