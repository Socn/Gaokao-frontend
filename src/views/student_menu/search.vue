<route lang="yaml">
meta:
  title: 搜索
</route>

<script setup lang="ts">
import {
  ElButton,
} from 'element-plus'
import { debounce, filter } from 'lodash-es'
import { useSessionStorage } from '@vueuse/core'
import studentAPI from '../../api/modules/student'
import type { Student } from '@/interfaces/student'
import { getSubArray } from '@/utils/subArray'
import type { FilterSelectElement } from '@/components/FilterSelect'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'
import { type StudentFilter, getWhereClause } from '@/utils/filters'

const router = useRouter()

const loadCnt = 50

let originStudentList: Array<Student> = []
let studentList: Array<Student> = []
const displayList = ref<Array<Student> >([])
const loading = ref<boolean>(true)

const searchName = useSessionStorage<string>('searchName', '')
const searchID = useSessionStorage<string>('searchID', '')

const filterSelector = ref(null as FilterSelectElement | null)
const filterSelectorVisible = ref(false)
const filterSelectorCanReturn = ref(false)

const filterEdit = ref(null as FilterSelectElement | null)
const filterEditVisible = ref(false)
const filterEditIndex = ref(-1)
const filterEditCanReturn = ref(false)

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

function lazyload() {
  if (displayList.value.length === studentList.length) return

  const dom = document.getElementById('lazyload')
  const tableDOM = dom?.querySelector('.el-scrollbar__wrap')
  if (tableDOM === undefined || tableDOM == null) return
  tableDOM.addEventListener('scroll', () => {
    const scrollDistance = tableDOM.scrollHeight - tableDOM.scrollTop - tableDOM.clientHeight
    if (scrollDistance <= 20) {
      displayList.value = [...displayList.value, ...getSubArray(studentList, displayList.value.length, displayList.value.length + loadCnt)]
    }
  })
}

function sortData(data: { column: any, prop: string, order: any }) {
  let inverse = 1
  if (data.order === 'ascending')inverse = -1
  const filteredList = originStudentList.filter((stu) => {
    const stuMap = new Map(Object.entries(stu))
    return stuMap.get(data.prop) !== -1
  })
  filteredList.sort((a: Student, b: Student) => {
    const aMap = new Map(Object.entries(a))
    const bMap = new Map(Object.entries(b))
    if (aMap.get(data.prop) < bMap.get(data.prop)) {
      return 1 * inverse
    }
    if (aMap.get(data.prop) > bMap.get(data.prop)) {
      return -1 * inverse
    }
    return 0
  })
  studentList = filteredList
  displayList.value = getSubArray(studentList, 0, 50)
  const tableDOM = document.getElementsByClassName('el-scrollbar__wrap')[0]
  tableDOM.scrollTo(0, 0)
}

function searchAll(enableLazyload?: boolean) {
  studentAPI.getGrade.all()
    .then((res: any) => {
      originStudentList = res.students
      studentList = originStudentList
      displayList.value = getSubArray(studentList, 0, 50)
      if (enableLazyload)lazyload()
    })
}
function searchNameID(name: string, id: string, enableLazyload?: boolean) {
  studentAPI.getGrade.byNameId(name, id)
    .then((res: any) => {
      originStudentList = res.students
      studentList = originStudentList
      displayList.value = getSubArray(studentList, 0, 50)
      if (enableLazyload)lazyload()
    })
}
function searchCondition(condition: string, enableLazyload?: boolean) {
  studentAPI.getGrade.byCondition(condition)
    .then((res: any) => {
      originStudentList = res.students
      studentList = originStudentList
      displayList.value = getSubArray(studentList, 0, 50)
      if (enableLazyload)lazyload()
    })
}

function searchStudent(enableLazyload?: boolean) {
  loading.value = true
  // no filters
  if (searchName.value === '' && searchID.value === '' && selected1.value === '' && cnt.value === 0 && filters.value.length === 0) {
    searchAll(enableLazyload)
  }
  // Only Name & ID
  else if (selected1.value === '' && cnt.value === 0 && filters.value.length === 0) {
    searchNameID(searchName.value, searchID.value, enableLazyload)
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
    searchCondition(finalWhereClause, enableLazyload)
  }
  loading.value = false
}
const debouncedSearch = debounce(searchStudent, 250)

function filterInvalid(data: { row: any, column: any, rowIndex: number, columnIndex: number }) {
  return data.row[data.column.property] === -1 ? 'invalid' : ''
}

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
function editCanReturn(ok: boolean) {
  filterEditCanReturn.value = ok
}
function handleEditFilterClose() {
  if (filterEdit.value == null) return
  const filter: StudentFilter = filterEdit.value.returnFilters()
  filters.value[filterEditIndex.value] = filter
  filterEditIndex.value = -1
  debouncedSearch()
}

// Get all students without filters on loading

searchStudent(true)

function handleJump(row: any) {
  router.push({
    path: '/students/info',
    query: {
      id: row.id,
    },
  })
}
</script>

<template>
  <div>
    <el-dialog
      v-model="filterSelectorVisible" title="选择筛选条件" width="900" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false"
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
      :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <FilterSelect v-if="filterEditVisible" ref="filterEdit" :can-return="editCanReturn" :edit-filter="filters[filterEditIndex]" />
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
    <PageMain>
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
              v-for="(item, index) in filters" :key="item"
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
      </el-space>
    </PageMain>
    <PageMain>
      <el-table id="lazyload" :data="displayList" stripe style="width: 100%;" height="600px" :cell-class-name="filterInvalid" @sort-change="sortData">
        <el-table-column prop="name" label="姓名" width="100" sortable="custom" fixed />
        <el-table-column prop="id" label="学号" width="120" sortable="custom" fixed />
        <el-table-column prop="chinese" label="语文" min-width="80" sortable />
        <el-table-column prop="math" label="数学" min-width="80" sortable="custom" />
        <el-table-column prop="english" label="英语" min-width="80" sortable="custom" />
        <el-table-column prop="physics" label="物理" min-width="80" sortable="custom" />
        <el-table-column prop="history" label="历史" min-width="80" sortable="custom" />
        <el-table-column prop="chemistry" label="化学" min-width="80" sortable="custom" />
        <el-table-column prop="biology" label="生物" min-width="80" sortable="custom" />
        <el-table-column prop="politics" label="政治" min-width="80" sortable="custom" />
        <el-table-column prop="geography" label="地理" min-width="80" sortable="custom" />
        <el-table-column label="操作" min-width="80" fixed="right">
          <template #default="scope">
            <ElButton link type="primary" size="small" @click="handleJump(scope.row)">
              查看详细
            </ElButton>
          </template>
        </el-table-column>
        <template #append>
          <ElButton type="text" loading style="width: 100%;height: 56px;font-size: 16px;" size="large" />
        </template>
      </el-table>
    </PageMain>
  </div>
</template>

<style>
.invalid {
  .cell {
    display: none;
  }
}
</style>
