<route lang="yaml">
meta:
  title: 搜索
</route>

<script setup lang="ts">
import {
  ElButton,
  ElIcon,
  ElTag,
  ElTooltip,
  TableV2FixedDir,
  valueEquals,
} from 'element-plus'
import studentAPI from '../../api/modules/student'
import type { Student } from '@/interfaces/student'
import onVisible from '@/utils/onVisible'
import { getSubArray } from '@/utils/subArray'

const loadCnt = 50

let studentList: Array<Student> = []
const displayList = ref<Array<Student> >([])
const loading = ref<boolean>(true)

studentAPI.getGrade.all()
  .then((res: any) => {
    studentList = res.students
    displayList.value = getSubArray(studentList, 0, 50)
    loading.value = false
    nextTick(() => {
      lazyload()
    })
  })

function lazyload() {
  if (displayList.value.length === studentList.length) return
  const lazyloadDOMList = document.getElementsByClassName('el-table__row')
  const lazyloadDOM = lazyloadDOMList[lazyloadDOMList.length - 10]
  onVisible(lazyloadDOM, () => {
    displayList.value = [...displayList.value, ...getSubArray(studentList, displayList.value.length, displayList.value.length + loadCnt)]
    nextTick(() => {
      lazyload()
    })
  })
}
</script>

<template>
  <div>
    <PageMain>
      搜索
      <el-table :data="displayList" stripe :load="loading" style="width: 100%;">
        <el-table-column prop="name" label="Name" width="180" />
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="chinese" label="Chinese" />
      </el-table>
    </PageMain>
  </div>
</template>
