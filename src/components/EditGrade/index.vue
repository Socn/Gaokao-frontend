<script setup lang="ts">
import { StudentC, emptyStudentInfo } from '@/interfaces/student'
import type { Student, StudentAPIResponse } from '@/interfaces/student'
import { subjectFullscore } from '@/interfaces/subject'
import { getSubArray } from '@/utils/subArray'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'

const props = withDefaults(defineProps<{
  stu: Student
  canReturn: Function
  newlyAdded?: boolean
}>(), {
  newlyAdded: false,
})

const studentInfo = new StudentC()
studentInfo.fromStudent(props.stu)

const studentInfoEntries = ref(Object.entries(studentInfo.groups).map(v => v[1]))
const editedStudentInfo = ref<Student>(JSON.parse(JSON.stringify(props.stu)))
const indexToGroup = ['main', 'second', 'third']
const indexToEntry = [['chinese', 'math', 'english'], ['physics', 'history'], ['chemistry', 'biology', 'politics', 'geography']]

const inputValid: Map<string, boolean> = new Map()

function returnEditedGrade() {
  const ret: StudentC = new StudentC().fromStudent(editedStudentInfo.value)
  return ret
}

function handleChange(value: any, prop: string, i: number, j: number, valid: boolean) {
  const group = editedStudentInfo.value.groups[indexToGroup[i]]
  editedStudentInfo.value.groups[indexToGroup[i]].grade[indexToEntry[i][j]] = value
  editedStudentInfo.value.groups[indexToGroup[i]].selectedCount = 0
  indexToEntry[i].forEach((prop) => {
    editedStudentInfo.value.groups[indexToGroup[i]].selectedCount += Number(group.grade[prop] !== -1)
  })

  let ok = true
  indexToGroup.forEach((g) => {
    const currGroup = editedStudentInfo.value.groups[g]
    if (currGroup.selectedCount !== currGroup.limit)ok = false
  })

  inputValid.set(prop, valid)
  inputValid.forEach((v) => {
    if (v === false) ok = false
  })

  if (props.newlyAdded) {
    if (editedStudentInfo.value.name === '' || editedStudentInfo.value.id === '')ok = false
  }
  props.canReturn(ok)
}

defineExpose({
  returnEditedGrade,
})
</script>

<template>
  <div>
    <el-space v-if="!props.newlyAdded" size="large">
      <div>
        <span color="gray">姓名 </span>
        <span style="font-size: 16px;">{{ studentInfo.name }}</span>
      </div>
      <div>
        <span color="gray">学号 </span>
        <span style="font-size: 16px;">{{ studentInfo.id }}</span>
      </div>
    </el-space>

    <div v-if="props.newlyAdded" style="margin-bottom: 8px;">
      <el-space style="margin-right: 16px;" direction="horizontal" size="small">
        <span>姓名 </span>
        <el-input v-model="editedStudentInfo.name" placeholder="姓名" style="width: 100px;" />
      </el-space>
      <el-space style="margin-right: 16px;" direction="horizontal" size="small">
        <span>学号 </span>
        <el-input v-model="editedStudentInfo.id" placeholder="学号" style="width: 100px;" />
      </el-space>
    </div>

    <div style="display: flex; flex-flow: row wrap;">
      <el-space direction="vertical" alignment="flex-start">
        <div v-for="(entry, index) in studentInfoEntries" :key="index">
          <div style="display: flex; flex-flow: row wrap;">
            <div v-for="(item, prop, j) in entry.grade" :key="j">
              <el-space style="margin-top: 8px; margin-right: 16px;" direction="horizontal" size="small">
                <span style="width: 28px;">{{ subjectPropToNameFunc(String(prop)) }}</span>
                <GradeInput
                  :grade="item" :on-change="(v: string, valid: boolean) => { handleChange(v === '' ? -1 : v, String(prop), index, j, valid) }"
                  style="width: 100px;" :placeholder="Number(item)"
                  :disabled="editedStudentInfo.groups[indexToGroup[index]].grade[indexToEntry[index][j]] === -1 && editedStudentInfo.groups[indexToGroup[index]].selectedCount === editedStudentInfo.groups[indexToGroup[index]].limit"
                  :min-grade="0" :max-grade="subjectFullscore.get(String(prop)) ?? 100"
                />
              </el-space>
            </div>
          </div>
        </div>
      </el-space>
    </div>
  </div>
</template>
