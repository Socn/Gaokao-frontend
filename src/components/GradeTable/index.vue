<script setup lang="ts">
import type { StudentC } from '@/interfaces/student'
import { getSubArray } from '@/utils/subArray'

const props = withDefaults(defineProps<{
  data: Array<StudentC>
  loading: boolean
  stripe?: boolean
  enableLazyload?: boolean
  maxRows?: number | undefined
  maxTableHeight?: string
  selectionChange?: Function
}>(), {
  stripe: true,
  enableLazyload: true,
  maxTableHeight: undefined,
  selectionChange: () => {},
})

const loadCnt = 50

const loading = ref<boolean>(false)

let studentList: Array<StudentC> = []
const displayList = ref<Array<StudentC> >([])

const domRef = ref<any>()
const tableRef = ref<any>()
const scrollTop = ref(0)

onActivated(() => {
  if (props.enableLazyload)lazyload()
})

function lazyload() {
  if (displayList.value.length === studentList.length) return

  const dom = domRef.value
  const tableDOM = dom?.querySelector('.el-scrollbar__wrap')
  if (tableRef.value === undefined || tableRef.value == null) return

  tableDOM.scrollTo({ top: scrollTop.value })
  tableDOM.addEventListener('scroll', () => {
    const scrollDistance = tableDOM.scrollHeight - tableDOM.scrollTop - tableDOM.clientHeight
    scrollTop.value = tableDOM.scrollTop
    if (scrollDistance <= 20) {
      displayList.value = [...displayList.value, ...getSubArray(studentList, displayList.value.length, displayList.value.length + loadCnt)]
    }
  }, { once: true })
}

function _filterList(data: { column: any, prop: string, order: any }, prop: string) {
  const filteredList = props.data.filter((stu) => {
    const stuMap = new Map(Object.entries(stu.toSimpleObj()))
    return stuMap.get(prop) !== -1
  })
  return filteredList
}

function _sortList(list: Array<StudentC>, prop: string, inverse: number) {
  list.sort((a: StudentC, b: StudentC) => {
    const aMap = new Map(Object.entries(a.toSimpleObj()))
    const bMap = new Map(Object.entries(b.toSimpleObj()))
    if ((aMap.get(prop) ?? 0) < (bMap.get(prop) ?? 0)) {
      return 1 * inverse
    }
    if ((aMap.get(prop) ?? 0) > (bMap.get(prop) ?? 0)) {
      return -1 * inverse
    }
    return 0
  })
}

function sortData(data: { column: any, prop: string, order: any }) {
  if (data.order == null) {
    studentList = props.data
    displayList.value = getSubArray(studentList, 0, 50)
    const tableDOM = domRef.value.getElementsByClassName('el-scrollbar__wrap')[0]
    tableDOM.scrollTo(tableDOM.scrollLeft, 0)
    return
  }
  const propList = data.prop.split('.')
  let prop = propList[propList.length - 1]
  if (prop === 'gradeSum')prop = 'sum'
  loading.value = true

  return new Promise((resolve) => {
    let inverse = 1
    if (data.order === 'ascending')inverse = -1
    const filteredList = _filterList(data, prop)
    _sortList(filteredList, prop, inverse)
    resolve(filteredList)
  }).then((data: any) => {
    studentList = data
    displayList.value = getSubArray(studentList, 0, 50)
    const tableDOM = document.getElementsByClassName('el-scrollbar__wrap')[0]
    tableDOM.scrollTo(tableDOM.scrollLeft, 0)
    loading.value = false
  })
}

function filterInvalid(data: { row: StudentC, column: any, rowIndex: number, columnIndex: number }) {
  if (data.columnIndex > 11 || data.columnIndex < 5) return // non-grade cells
  return Object.entries(data.row.toAPIResponse())[data.columnIndex - 1][1] === -1 ? 'invalid' : ''
}

function clearSort() {
  if (tableRef.value !== undefined)tableRef.value.clearSort()
}

function initDisplay() {
  studentList = props.data
  if (props.enableLazyload) {
    displayList.value = getSubArray(studentList, 0, 50)
  }
  else {
    if (props.maxRows !== undefined)displayList.value = getSubArray(studentList, 0, props.maxRows)
    else displayList.value = studentList
  }
}

defineExpose({
  initDisplay,
  clearSort,
})

watchEffect(() => {
  initDisplay()
})

watchEffect(() => {
  if (props.enableLazyload)lazyload()
})

const averages = ref<Array<string>>([])
function getAverages() {
  if (props.data.length === 0 || props.loading) return
  const entries = Object.entries(props.data[0].toSimpleObj())
  entries.forEach((prop, index) => {
    if (index === 0 || index === 1) return
    if (entries[index] === undefined) return
    let cnt: number = 0
    averages.value[index + 1] = (props.data.reduce((prev, curr) => {
      const value = Object.entries(curr.toSimpleObj())[index][1]
      if (!Number.isNaN(value) && Number(value) !== -1) {
        cnt++
        return prev + Number(value)
      }
      else {
        return prev
      }
    }, 0) / cnt).toFixed(3)
  })
}

watchEffect(() => {
  getAverages()
})

function getSummaries(param: { columns: any[], data: any[] }) {
  const columns = param.columns
  const sums: (string | VNode)[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h('div', { style: { textDecoration: 'underline' } }, [
        '平均分',
      ])
      return
    }
    if (index === 1 || index === 2) {
      sums[index] = h('div')
      return
    }

    sums[index] = averages.value[index]
  })

  return sums
}
</script>

<template>
  <div ref="domRef">
    <el-table
      id="lazyload" ref="tableRef" v-loading="loading || props.loading" :data="displayList" :stripe="props.stripe"
      style="width: 100%;" :cell-class-name="filterInvalid" :row-style="{ height: '54px' }"
      :cell-style="{ padding: 0 }"
      :max-height="props.maxTableHeight"
      show-summary
      :summary-method="getSummaries"
      @sort-change="sortData" @selection-change="props.selectionChange"
    >
      <slot name="pre-append" />
      <el-table-column label="序号" fixed>
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100" sortable="custom" fixed />
      <el-table-column prop="id" label="学号" width="120" sortable="custom" fixed />
      <el-table-column prop="groups.main.grade.chinese" label="语文" min-width="80" sortable="custom" />
      <el-table-column prop="groups.main.grade.math" label="数学" min-width="80" sortable="custom" />
      <el-table-column prop="groups.main.grade.english" label="英语" min-width="80" sortable="custom" />
      <el-table-column prop="groups.second.grade.physics" label="物理" min-width="80" sortable="custom" />
      <el-table-column prop="groups.second.grade.history" label="历史" min-width="80" sortable="custom" />
      <el-table-column prop="groups.third.grade.chemistry" label="化学" min-width="80" sortable="custom" />
      <el-table-column prop="groups.third.grade.biology" label="生物" min-width="80" sortable="custom" />
      <el-table-column prop="groups.third.grade.politics" label="政治" min-width="80" sortable="custom" />
      <el-table-column prop="groups.third.grade.geography" label="地理" min-width="80" sortable="custom" />
      <el-table-column prop="gradeSum" label="总分" min-width="80" sortable="custom" fixed="right" />
      <slot name="column" />
      <template #append>
        <slot name="append" />
      </template>
    </el-table>
  </div>
</template>
