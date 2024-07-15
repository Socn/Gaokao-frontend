<route lang="yaml">
meta:
  title: 搜索
  name: search
</route>

<script setup lang="ts">
import {
  ElButton,
} from 'element-plus'
import { debounce, throttle } from 'lodash-es'
import { useSessionStorage } from '@vueuse/core'
import studentAPI from '../../api/modules/student'
import type { Student, StudentAPIResponse } from '@/interfaces/student'
import { StudentC, emptyStudentInfo } from '@/interfaces/student'
import type { FilterSelectElement } from '@/components/FilterSelect'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'
import { type StudentFilter, getWhereClause } from '@/utils/filters'

defineOptions({
  name: 'Search',
})

const router = useRouter()

const tableRef = ref()
const studentList = ref<Array<StudentC>>([])

const loading = ref<boolean>(true)

const searchName = ref<string>('')
const searchID = ref<string>('')

const filterSelector = ref(null as FilterSelectElement | null)
const filterSelectorVisible = ref(false)
const filterSelectorCanReturn = ref(false)

const filterEdit = ref(null as FilterSelectElement | null)
const filterEditVisible = ref(false)
const filterEditIndex = ref(-1)
const filterEditCanReturn = ref(true)

const editGrade = ref()
const editGradeVisible = ref(false)
const editGradeInfo = ref<Student>(emptyStudentInfo)
const editGradeIndex = ref(-1)
const editGradeCanReturn = ref(true)

const addGrade = ref()
const addGradeVisible = ref(false)
const addGradeCanReturn = ref(false)

const importRef = ref()
const importVisible = ref(false)

// const filters = ref<Array<StudentFilter>>([])
const filters = useSessionStorage<Array<StudentFilter>>('filters', [])

const selected1 = useSessionStorage<'' | 'physics' | 'history'>('selected1', '')
const cnt = useSessionStorage('selected2cnt', 0)
const subjects = useSessionStorage('selected2', [
  {
    prop: 'chemistry',
    selected: false,
  },
  {
    prop: 'biology',
    selected: false,
  },
  {
    prop: 'politics',
    selected: false,
  },
  {
    prop: 'geography',
    selected: false,
  },
])

function searchAll() {
  studentAPI.getGrade.all()
    .then((res: any) => {
      studentList.value = []
      res.data.students.forEach((stu: StudentAPIResponse) => {
        studentList.value?.push(new StudentC(stu))
      })
    })
}
function searchNameID(name: string, id: string) {
  studentAPI.getGrade.byNameId(name, id)
    .then((res: any) => {
      studentList.value = []
      res.data.students.forEach((stu: StudentAPIResponse) => {
        studentList.value?.push(new StudentC(stu))
      })
    })
}
function searchCondition(condition: string) {
  studentAPI.getGrade.byCondition(condition)
    .then((res: any) => {
      studentList.value = []
      res.data.students.forEach((stu: StudentAPIResponse) => {
        studentList.value?.push(new StudentC(stu))
      })
    })
}

function searchStudent(): Promise<boolean> {
  if (tableRef.value !== undefined)tableRef.value.clearSort()

  // no filters
  if (searchName.value === '' && searchID.value === '' && selected1.value === '' && cnt.value === 0 && filters.value.length === 0) {
    searchAll()
  }
  // Only Name & ID
  else if (selected1.value === '' && cnt.value === 0 && filters.value.length === 0) {
    searchNameID(searchName.value, searchID.value)
  }
  else {
    // with filters
    let subjectWhereClause: string = ''
    let filterWhereClause: string = ''
    let finalWhereClause: string = ''
    if (selected1.value !== '') {
      subjectWhereClause += `${selected1.value}!=-1`
    }
    if (cnt.value !== 0) {
      subjects.value.forEach((subject) => {
        if (!subject.selected) return
        if (subjectWhereClause !== '')subjectWhereClause += ' AND '
        subjectWhereClause += `${subject.prop}!=-1`
      })
    }
    if (filters.value.length !== 0) {
      filters.value.forEach((filter, index) => {
        if (index !== 0)filterWhereClause += ' or '
        filterWhereClause += getWhereClause(filter)
      })
    }
    if (subjectWhereClause === '')finalWhereClause = filterWhereClause
    else if (filterWhereClause === '')finalWhereClause = subjectWhereClause
    else finalWhereClause = `${subjectWhereClause} AND ${filterWhereClause}`
    searchCondition(finalWhereClause)
  }
  //  console.log(studentList.value)
  return new Promise((resolve) => {
    resolve(true)
  })
}
const debouncedSearch = debounce(searchStudent, 250)
const throttledSearch = throttle(() => {
  loading.value = true
  searchStudent().then(() => {
    loading.value = false
  })
}, 500)

function select2(prop: 'physics' | 'history') {
  selected1.value = selected1.value === prop ? '' : prop
  debouncedSearch()
}
function select4(subject: { prop: string, selected: boolean }) {
  subject.selected = !subject.selected
  if (subject.selected === false)cnt.value--
  else cnt.value++
  debouncedSearch()
}

function handleSelectFilterClose() {
  if (filterSelector.value == null) return
  const filter = filterSelector.value.returnFilters()
  filters.value.push(filter)
  debouncedSearch()
}
function handleRemoveFilter(index: number) {
  filters.value.splice(index, 1)
  debouncedSearch()
}
function selectCanReturn(ok: boolean) {
  filterSelectorCanReturn.value = ok
}

function handleEditFilter(index: number) {
  filterEditIndex.value = index
  filterEditVisible.value = true
}
function filterEditCanReturnFunc(ok: boolean) {
  filterEditCanReturn.value = ok
}
function handleEditFilterClose() {
  if (filterEdit.value == null) return
  const filter: StudentFilter = filterEdit.value.returnFilters()
  filters.value[filterEditIndex.value] = filter
  filterEditIndex.value = -1
  debouncedSearch()
}

function editGradeCanReturnFunc(ok: boolean) {
  editGradeCanReturn.value = ok
}
function handleEditGrade(row: Student, scope: any) {
  editGradeInfo.value = row
  editGradeIndex.value = scope.$index
  editGradeVisible.value = true
}
function handleEditGradeClose() {
  if (editGrade.value == null || editGradeIndex.value === -1) return
  const editedGrade = editGrade.value.returnEditedGrade()
  studentAPI.editGrade(editedGrade).then(() => {
    searchStudent().then((success) => {
      editGradeVisible.value = !success
    })
  })
}

function addGradeCanReturnFunc(ok: boolean) {
  addGradeCanReturn.value = ok
}
function handleAddGradeClose() {
  if (addGrade.value == null) return
  const addedGrade = addGrade.value.returnEditedGrade()
  studentAPI.addGrade(addedGrade).then(() => {
    searchStudent().then((success) => {
      addGradeVisible.value = !success
    })
  })
}

function handleImportClose(refresh: boolean) {
  if (!refresh) {
    importVisible.value = false
    return
  }
  searchStudent().then(() => {
    importVisible.value = false
  })
}

// function setHeight() {
//   const mainDOM = document.getElementsByClassName('main')[0]
//   const toolsDOM = document.getElementsByClassName('grade-search-tools')[0]
//   tableHeight.value = mainDOM.clientHeight - toolsDOM.clientHeight - 32 - 40 - 16
// }
// const debouncedSetHeight = throttle(setHeight, 500, { leading: true })

// Get all students without filters on loading
searchStudent().then(() => {
  loading.value = false
})

// onMounted(() => {
//   window.addEventListener('resize', debouncedSetHeight)
//   setHeight()
// })

function handleJump(row: any) {
  router.push({
    path: `/students/detail/${row.id}`,
  })
}

const confirmDelete = ref(false)
function handleDeleteStudent() {
  confirmDelete.value = true
}

function handleConfirmDelete() {
  studentAPI.deleteGrade(new StudentC().fromStudent(editGradeInfo.value)).then(() => {
    confirmDelete.value = false
    editGradeVisible.value = false
    nextTick(() => throttledSearch())
  })
}
</script>

<template>
  <div style="display: flex;flex-direction: column;height: 100%;">
    <el-dialog
      v-model="filterSelectorVisible" title="选择筛选条件" width="700" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false" :before-close="() => filterSelectorVisible = false"
    >
      <FilterSelect v-if="filterSelectorVisible" ref="filterSelector" :can-return="selectCanReturn" />
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="filterSelectorVisible = false">
            取消
          </ElButton>
          <ElButton
            type="primary"
            :disabled="!filterSelectorCanReturn"
            @click="() => {
              handleSelectFilterClose()
              filterSelectorVisible = false
            }"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="filterEditVisible" title="修改筛选条件" width="900" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false" :before-close="() => filterEditVisible = false"
    >
      <FilterSelect v-if="filterEditVisible" ref="filterEdit" :can-return="filterEditCanReturnFunc" :edit-filter="filters[filterEditIndex]" />
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="filterEditVisible = false">
            取消
          </ElButton>
          <ElButton
            type="primary"
            :disabled="!filterEditCanReturn"
            @click="() => {
              handleEditFilterClose()
              filterEditVisible = false
            }"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editGradeVisible" title="修改成绩" width="500" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false" :before-close="() => editGradeVisible = false"
    >
      <EditGrade v-if="editGradeVisible" ref="editGrade" :stu="editGradeInfo" :can-return="editGradeCanReturnFunc" />
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="danger" @click="handleDeleteStudent">
            删除该条成绩
          </ElButton>
          <ElButton @click="editGradeVisible = false">
            取消
          </ElButton>
          <ElButton
            type="primary"
            :disabled="!editGradeCanReturn"
            @click="() => {
              handleEditGradeClose()
            }"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="confirmDelete" title="确定删除该条成绩？" width="300" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="confirmDelete = false">
            取消
          </ElButton>
          <ElButton
            type="danger"
            @click="handleConfirmDelete"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="addGradeVisible" title="添加成绩" width="500" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false" :before-close="() => addGradeVisible = false"
    >
      <EditGrade v-if="addGradeVisible" ref="addGrade" :stu="emptyStudentInfo" :can-return="addGradeCanReturnFunc" newly-added />
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="addGradeVisible = false">
            取消
          </ElButton>
          <ElButton
            type="primary"
            :disabled="!addGradeCanReturn"
            @click="() => {
              handleAddGradeClose()
            }"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="importVisible" title="从 Excel 导入" width="900" style="color: black;"
    >
      <ImportExcel v-if="importVisible" ref="importRef" :close="handleImportClose" />
    </el-dialog>

    <PageMain class="grade-search-tools">
      <el-tooltip
        content="刷新"
      >
        <ElButton circle style="position: absolute; top: 16px; right: 16px;" @click="throttledSearch">
          <div class="i-material-symbols:refresh" />
        </ElButton>
      </el-tooltip>

      <el-space wrap size="default" style="display: flex; flex-direction: column; align-items: start; justify-content: center;">
        <el-space wrap size="small">
          <span style="line-height: 24px;">搜索学生</span>
          <el-input
            v-model="searchName"
            style="width: 240px;"
            placeholder="姓名"
            clearable
            @change="debouncedSearch()"
          />
          <el-input
            v-model="searchID"
            style="width: 240px;"
            placeholder="学号"
            clearable
            @change="debouncedSearch()"
          />
          <ElButton @click="debouncedSearch()">
            确定
          </ElButton>
        </el-space>

        <el-space wrap size="small">
          <span style="line-height: 24px;">选科筛选</span>
          <el-space wrap>
            <ElButton :type="selected1 === 'physics' ? 'primary' : ''" @click="select2('physics')">
              物理
            </ElButton>
            <ElButton :type="selected1 === 'history' ? 'primary' : ''" @click="select2('history')">
              历史
            </ElButton>
            <ElButton v-for="subject in subjects" :key="subject.prop" :type="subject.selected ? 'primary' : ''" :disabled="cnt >= 2 && !subject.selected" @click="select4(subject)">
              {{ subjectPropToNameFunc(subject.prop) }}
            </ElButton>
          </el-space>
        </el-space>

        <el-space wrap size="small" style="flex-direction: row;">
          <span style="line-height: 24px;">更多筛选</span>
          <el-space wrap size="small" style="max-width: 100%;">
            <el-tag
              v-for="(item, index) in filters" :key="index"
              size="large" effect="plain" style="height: unset; min-height: 32px; cursor: pointer;" disable-transitions closable
              @close="handleRemoveFilter(index)" @click="handleEditFilter(index)"
            >
              <FilterTag :filter="item" />
            </el-tag>
          </el-space>
          <ElButton style=" height: 28px;font-size: 18px; line-height: 28px;" @click="filterSelectorVisible = true">
            +
          </ElButton>
        </el-space>

        <Auth value="grade.add">
          <el-space wrap size="small" style="flex-direction: row;">
            <span style="line-height: 24px;">管理</span>
            <ElButton type="primary" plain @click="addGradeVisible = true">
              添加成绩
            </ElButton>
            <ElButton type="primary" plain @click="importVisible = true">
              从 Excel 导入成绩
            </ElButton>
          </el-space>
        </Auth>
      </el-space>
    </PageMain>
    <PageMain style="height: 100%;margin-top: 0;" class="gradeTable">
      <KeepAlive>
        <ElAutoResizer>
          <template #default="{ height }">
            <span style="font-size: var(--el-font-size-base); line-height: 20px;">共{{ studentList.length }}条成绩</span>
            <GradeTable ref="tableRef" :data="studentList" :loading="loading" :max-table-height="String(height)" sty>
              <template #column>
                <el-table-column label="操作" min-width="80" fixed="right">
                  <template #default="scope">
                    <el-space style="flex-direction: column;">
                      <ElButton link type="primary" size="small" @click="handleJump(scope.row)">
                        查看详细
                      </ElButton>
                      <Auth value="grade.edit">
                        <ElButton link type="primary" size="small" @click="handleEditGrade(scope.row, scope)">
                          编辑
                        </ElButton>
                      </Auth>
                    </el-space>
                  </template>
                </el-table-column>
              </template>
            </GradeTable>
          </template>
        </ElAutoResizer>
      </KeepAlive>
    </PageMain>
  </div>
</template>

<style>
.invalid {
  .cell {
    display: none;
  }
}

.gradeTable .main-container {
  height: 100%;
}
</style>
