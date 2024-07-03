<script setup lang="ts">
import { ElButton, useProp } from 'element-plus'
import { fa } from 'element-plus/es/locale/index.mjs'
import type { StudentFilter } from '@/utils/filters'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'
import type { Subject } from '@/interfaces/subject'
import { subjectFullscore } from '@/interfaces/subject'

const props = defineProps<{
  editFilter?: StudentFilter
  canReturn: Function
}>()

const subjectList: Array<{ limit: number, subjects: Array<{ subject: Subject, selected: number }> } > = [{
  limit: 3,
  subjects: [
    { subject: { prop: 'chinese' }, selected: 0 },
    { subject: { prop: 'math' }, selected: 0 },
    { subject: { prop: 'english' }, selected: 0 },
  ],
}, {
  limit: 1,
  subjects: [
    { subject: { prop: 'physics' }, selected: 0 },
    { subject: { prop: 'history' }, selected: 0 },
  ],
}, {
  limit: 2,
  subjects: [
    { subject: { prop: 'chemistry' }, selected: 0 },
    { subject: { prop: 'biology' }, selected: 0 },
    { subject: { prop: 'politics' }, selected: 0 },
    { subject: { prop: 'geography' }, selected: 0 },
  ],
}]

interface WrappedStudentFilter extends StudentFilter {
  subjectCount: Array<number>
}

const filters = ref<Array<WrappedStudentFilter> >([])
const subjectCount = [0, 0, 0]

function checkReturn() {
  let ok = true
  if (filters.value.length === 0)ok = false
  filters.value.forEach((filter) => {
    if (filter.subjects.length === 0)ok = false
  })
  props.canReturn(ok)
}

function addFilter() {
  filters.value.push({
    type: 'single',
    subjects: [],
    constrains: [0, 0],
    subjectCount: [0, 0, 0],
  })
  checkReturn()
}
function removeFilter(index: number) {
  filters.value.splice(index, 1)
  checkReturn()
}

function calcFullscore(filter: WrappedStudentFilter) {
  let fullscore = 0
  filter.subjects.forEach((subject) => {
    fullscore += subjectFullscore.get(subject.prop) ?? 0
  })
  return fullscore
}

function handleChange(value: any, filter: WrappedStudentFilter) {
  filter.type = filter.subjects.length > 1 ? 'sum' : 'single'
  checkReturn()
}

function handleTest(item: { subject: Subject, selected: number }, groupIndex: number, filter: WrappedStudentFilter) {
  if (filter.subjects.includes(item.subject)) {
    if (item.selected === 0)subjectCount[groupIndex]++
    item.selected++
  }
  else {
    if (item.selected === 1)subjectCount[groupIndex]--
    item.selected--
  }
}
function checkDisabled(item: { subject: Subject, selected: number }, groupLimit: number, groupIndex: number) {
  return item.selected === 0 && subjectCount[groupIndex] >= groupLimit
}

function addFilterFromSource(source: StudentFilter) {
  filters.value.push({
    ...source,
    subjectCount: [0, 0, 0],
  })
  if (source.and !== undefined)addFilterFromSource(source.and)
}
onMounted(() => {
  if (props.editFilter !== undefined && props.editFilter !== null)addFilterFromSource(props.editFilter)
  props.canReturn(false)
  checkReturn()
})

function returnFilters() {
  let retFilter: StudentFilter = filters.value[filters.value.length - 1]
  for (let index = filters.value.length - 2; index >= 0; index--) {
    const currFilter: StudentFilter = filters.value[index]
    currFilter.and = retFilter
    retFilter = currFilter
  }
  filters.value = []
  return retFilter
}

defineExpose({
  returnFilters,
})
</script>

<template>
  <div style="display: flex; flex-direction: column;">
    <div
      v-for="(filter, index) in filters" :key="index" style="display: flex; flex-direction: row; margin-bottom: 8px;"
    >
      <div style="width: 20px; height: 32px; margin-right: 8px;">
        <span v-if="index !== 0" style="line-height: 32px;">且</span>
      </div>
      <div style="display: flex; flex-direction: column; margin-right: 8px;">
        <el-select
          v-model="filter.subjects"
          placeholder="选择科目"
          style="width: 120px;"
          multiple
          value-key="prop"
          @change="(value: any) => handleChange(value, filter)"
        >
          <el-option-group
            v-for="(group, groupIndex) in subjectList"
            :key="groupIndex"
          >
            <el-option
              v-for="item in group.subjects"
              :key="item.subject.prop"
              :label="subjectPropToNameFunc(item.subject.prop)"
              :value="item.subject"
              :disabled="checkDisabled(item, group.limit, groupIndex)"
              @click="handleTest(item, groupIndex, filter)"
            />
          </el-option-group>
        </el-select>
      </div>
      <div style="width: 80px; height: 32px;  margin-right: 8px; line-height: 32px;">
        <span>{{ `${filter.type === 'single' ? '分数' : '总分'}介于` }}</span>
      </div>
      <div class="slider" style="display: flex; flex-direction: row;width: 100%; height: 32px; margin-right: 8px;">
        <el-input v-model="filter.constrains[0]" maxlength="3" style="width: 100px;" />
        <el-slider v-model="filter.constrains" range :max="calcFullscore(filter)" style=" margin-right: 16px;margin-left: 16px;" :step="0.5" />
        <el-input v-model="filter.constrains[1]" maxlength="3" style="width: 100px;" />
      </div>
      <ElButton text style=" width: 32px;" type="danger" @click="removeFilter(index)">
        <i class="i-material-symbols:delete" style="font-size: 16px;" />
      </ElButton>
    </div>
    <ElButton @click="addFilter">
      添加条件
    </ElButton>
  </div>
</template>
