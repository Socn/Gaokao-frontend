<script setup lang="ts">
const props = defineProps<{
  grade: string | number
  onChange: (v: any, valid: boolean) => void
  placeholder: number
  disabled: boolean
  maxGrade: number
  minGrade: number
}>()

const model = ref<string>(props.grade === -1 ? '' : String(props.grade))
const input = ref(null as HTMLElement | null)

function validate(v: number) {
  return (v >= props.minGrade && v <= props.maxGrade) && Number.isInteger(v * 2)
}

function handleChange(v: any) {
  props.onChange(v, validate(v))
}
</script>

<template>
  <el-input
    ref="input" v-model="model"
    :placeholder="props.placeholder === -1 ? '' : String(props.placeholder)" :disabled="props.disabled"
    :class="{
      'input-error': !validate(Number(model)),
    }"
    @input="handleChange"
  />
</template>

<style>
.el-input.input-error .el-input__wrapper {
  background-color: #fee;

  .el-input__inner {
    color: #eb4747;
  }
}
</style>
