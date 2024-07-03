<script setup lang="ts">
import type { StudentFilter } from '@/utils/filters'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'

const props = defineProps<{ filter: StudentFilter }>()
const filters = ref<Array<StudentFilter> >([])
function convertNestedToArray(nested: StudentFilter) {
  filters.value.push({
    type: nested.type,
    subjects: nested.subjects,
    constrains: nested.constrains,
  })
  if (nested.and !== undefined && nested.and !== null)convertNestedToArray(nested.and)
}

convertNestedToArray(props.filter)
</script>

<template>
  <el-space style="flex-flow: row wrap;">
    <el-space v-for="(f, index) in filters" :key="index" style=" flex-direction: row;">
      <span v-if="index !== 0" style="line-height: 20px;">且</span>
      <el-space wrap style="flex-direction: row;" size="small">
        <el-tag v-for="subject in f.subjects" :key="subject.prop" size="small" style="padding: 0 4px;" disable-transitions>
          {{ subjectPropToNameFunc(subject.prop) }}
        </el-tag>
      </el-space>
      <span style="line-height: 20px;">{{ `${f.type === 'single' ? '分数' : '总分'}介于` }}</span>
      <el-tag size="small" type="success" disable-transitions>
        {{ `[${f.constrains[0]}, ${f.constrains[1]}]` }}
      </el-tag>
    </el-space>
  </el-space>
</template>
