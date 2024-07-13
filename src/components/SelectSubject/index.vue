<script setup lang="ts">
import type { Subject } from '@/interfaces/subject'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'

const props = defineProps<{
  obj: {
    subjectCount: Array<number>
    subjects: Array<Subject>
  }
  onChange: Function
}>()

const obj = ref(props.obj)

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
}, {
  limit: 1,
  subjects: [
    { subject: { prop: 'sum' }, selected: 0 },
  ],
}]

function handleSubjectChange(value: any) {
  props.onChange(value)
}
function handleTest(item: { subject: Subject, selected: number }, groupIndex: number, obj: any) {
  if (obj.subjects.includes(item.subject)) {
    if (item.selected === 0)obj.subjectCount[groupIndex]++
    item.selected++
  }
  else {
    if (item.selected === 1)obj.subjectCount[groupIndex]--
    item.selected--
  }
}
function checkDisabled(item: { subject: Subject, selected: number }, groupLimit: number, groupIndex: number, obj: any) {
  if (subjectList[3].subjects[0].selected) {
    return item.subject.prop !== 'sum'
  }
  if (item.subject.prop === 'sum') {
    return (obj.subjectCount[0] + obj.subjectCount[1] + obj.subjectCount[2]) > 0
  }
  return item.selected === 0 && obj.subjectCount[groupIndex] >= groupLimit
}
</script>

<template>
  <el-select
    v-model="obj.subjects"
    placeholder="选择科目"
    multiple
    value-key="prop"
    @change="handleSubjectChange"
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
        :disabled="checkDisabled(item, group.limit, groupIndex, obj)"
        @click="handleTest(item, groupIndex, obj)"
      />
    </el-option-group>
  </el-select>
</template>
