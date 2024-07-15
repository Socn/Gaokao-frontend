<route lang="yaml">
meta:
  title: 总览
  name: overall
</route>

<script setup lang="ts">
import VChart from '@visactor/vchart'
import type { IOrientType } from '@visactor/vchart/esm/typings'
import type { IFilterMode } from '@visactor/vchart/esm/component/data-zoom'
import { debounce } from 'lodash-es'
import type { AxisType } from '@visactor/vchart/esm/component/axis'
import type { StudentAPIResponse } from '@/interfaces/student'
import { StudentC } from '@/interfaces/student'
import studentAPI from '@/api/modules/student'
import { subjectPropToName, subjectPropToNameFunc } from '@/utils/subjectPropToName'
import type { Subject } from '@/interfaces/subject'
import { subjectFullscore } from '@/interfaces/subject'

defineOptions({
  name: 'Overall',
})

const studentList = ref<Array<{
  name: string
  id: string
  chinese: number
  math: number
  english: number
  physics: number
  history: number
  chemistry: number
  biology: number
  politics: number
  geography: number
  sum: number
}>>([])
const gradeRange = ref<Map<string, Array<{
  start: number
  end: number
  count: number
  name: string
}>>>(new Map<string, Array<{
  start: number
  end: number
  count: number
  name: string
}>>())
const gradeInfo = ref<Map<string, {
  count: number
  sum: number
}>>(new Map<string, {
  count: number
  sum: number
}>())
const gradeSplit = ref<number>(5)

const subjectChoices: Map<string, number> = new Map<string, number>()

const subject = ref<string>('chinese')
const subjects = Array.from(subjectPropToName)

const xSubjects = ref({
  subjectCount: [0, 0, 0],
  subjects: new Array<Subject>(),
})
const ySubjects = ref({
  subjectCount: [0, 0, 0],
  subjects: new Array<Subject>(),
})

let vchart: VChart
function getInitGradeRange(prop: string, maxGrade: number) {
  const ret = []
  const step = maxGrade / gradeSplit.value
  for (let i = 0; i < step; i++) {
    ret.push({
      start: i * gradeSplit.value,
      end: (i + 1) * gradeSplit.value,
      count: 0,
      name: prop,
    })
  }
  return ret
}

function getGradeSplit() {
  gradeRange.value.clear()
  studentList.value.forEach((element) => {
    const array = Object.entries(element)
    array.forEach((prop) => {
      if (prop[0] === 'name' || prop[0] === 'id') return

      let arr
      if (gradeRange.value?.has(prop[0]))arr = gradeRange.value?.get(prop[0])
      else arr = getInitGradeRange(prop[0], subjectFullscore.get(prop[0]) ?? 0)
      if (arr === undefined) return

      if (prop[1] === -1) return
      let index = Math.floor(Number(prop[1]) / gradeSplit.value)
      if (Number(prop[1]) >= (subjectFullscore.get(prop[0]) ?? 0))index = ((subjectFullscore.get(prop[0]) ?? 0) / gradeSplit.value) - 1
      arr[index].count++
      gradeRange.value?.set(prop[0], arr)

      const oldGradeInfo = gradeInfo.value.get(prop[0])
      gradeInfo.value.set(prop[0], {
        count: (oldGradeInfo?.count ?? 0) + 1,
        sum: (oldGradeInfo?.sum ?? 0) + Number(prop[1]),
      })
    })
  })
}

function choiceAddOne(choice: string) {
  if (!subjectChoices.has(choice)) {
    subjectChoices.set(choice, 1)
  }
  else {
    const count = subjectChoices.get(choice) ?? 0
    subjectChoices.set(choice, count + 1)
  }
}

function getSubjectChoiceCount() {
  studentList.value.forEach((element) => {
    if (element.physics !== -1 && element.chemistry !== -1 && element.biology !== -1)choiceAddOne('物化生')
    else if (element.physics !== -1 && element.chemistry !== -1 && element.geography !== -1)choiceAddOne('物化地')
    else if (element.physics !== -1 && element.chemistry !== -1 && element.politics !== -1)choiceAddOne('物化政')
    else if (element.physics !== -1 && element.biology !== -1 && element.geography !== -1)choiceAddOne('物生地')
    else if (element.physics !== -1 && element.biology !== -1 && element.politics !== -1)choiceAddOne('物生政')
    else if (element.physics !== -1 && element.politics !== -1 && element.geography !== -1)choiceAddOne('物政地')
    else if (element.history !== -1 && element.chemistry !== -1 && element.biology !== -1)choiceAddOne('史化生')
    else if (element.history !== -1 && element.chemistry !== -1 && element.geography !== -1)choiceAddOne('史化地')
    else if (element.history !== -1 && element.chemistry !== -1 && element.politics !== -1)choiceAddOne('史化政')
    else if (element.history !== -1 && element.biology !== -1 && element.geography !== -1)choiceAddOne('史生地')
    else if (element.history !== -1 && element.biology !== -1 && element.politics !== -1)choiceAddOne('史生政')
    else if (element.history !== -1 && element.politics !== -1 && element.geography !== -1)choiceAddOne('史政地')
  })
}

const dataZoomOrient: IOrientType = 'bottom'
const dataZoomFilterMode: IFilterMode = 'axis'
function displayChart() {
  // console.log(Array.from(gradeRange.value).map(([prop, value]) => ({
  //   name: prop,
  //   id: prop,
  //   values: value,
  // })).flat())
  const spec = {
    data: {
      name: 'data',
      id: 'data',
      values: gradeRange.value.get(subject.value) ?? [],
    },
    type: 'histogram',
    xField: 'start',
    x2Field: 'end',
    yField: 'count',
    bar: {
      style: {
        stroke: 'white',
        fill: '#409eff',
        lineWidth: 1,
      },
    },
    tooltip: {
      visible: true,
      mark: {
        title: {
          key: 'title',
          value: (datum: any) => (subjectPropToName.get(datum.name) ?? ''),
        },
        content: [
          {
            key: (datum: any) => `${datum.start}~${datum.end}`,
            value: (datum: any) => datum.count,
          },
        ],
      },
      dimension: {
        visible: false,
      },
    },
    dataZoom: [
      {
        orient: dataZoomOrient,
        filterMode: dataZoomFilterMode,
        backgroundChart: {
          area: {
            style: {
              lineWidth: 1,
              fill: '#D1DBEE',
            },
          },
          line: {
            style: {
              stroke: '#D1DBEE',
              lineWidth: 1,
            },
          },
        },
        selectedBackgroundChart: {
          area: {
            style: {
              lineWidth: 1,
              fill: '#fbb934',
            },
          },
          line: {
            style: {
              stroke: '#fbb934',
              lineWidth: 1,
            },
          },
        },
        startText: {
          formatMethod: (text: string | number) => String(Math.floor(Number(text))),
        },
        endText: {
          formatMethod: (text: string | number) => String(Math.floor(Number(text))),
        },
      },
    ],
  }

  if (vchart === undefined) {
    vchart = new VChart(spec, { dom: 'histogram', animation: false })
    vchart.renderSync()
  }
  else {
    vchart.updateSpec(spec)
  }
}

const legendsOrient: IOrientType = 'left'
function displayPieChart() {
  const spec = {
    type: 'pie',
    data: [
      {
        id: 'id0',
        values: Array.from(subjectChoices).map(([choice, count]) => ({ choice, count })),
      },
    ],
    outerRadius: 0.8,
    innerRadius: 0.5,
    padAngle: 0.6,
    valueField: 'count',
    categoryField: 'choice',
    pie: {
      style: {
        cornerRadius: 10,
      },
      state: {
        hover: {
          outerRadius: 0.85,
          stroke: '#000',
          lineWidth: 1,
        },
        selected: {
          outerRadius: 0.85,
          stroke: '#000',
          lineWidth: 1,
        },
      },
    },
    legends: {
      visible: true,
      orient: legendsOrient,
    },
    label: {
      visible: true,
    },
    tooltip: {
      mark: {
        content: [
          {
            key: (datum: any) => datum.choice,
            value: (datum: any) => datum.count,
          },
        ],
      },
    },
    indicator: {
      visible: true,
      title: {
        visible: true,
        style: {
          fontSize: 18,
          text: '总和',
        },
      },
      content: [
        {
          visible: true,
          style: {
            fontSize: 18,
            text: studentList.value.length,
          },
        },
      ],
    },
  }
  const piechart = new VChart(spec, { dom: 'piechart' })
  piechart.renderSync()
}

let scatterChart: VChart
function getScatterData() {
  if (xSubjects.value.subjects.length === 0 || ySubjects.value.subjects.length === 0) return []
  const ret: Array<{
    name: string
    xSum: number
    ySum: number
  }> = []
  const x = xSubjects.value.subjects
  const y = ySubjects.value.subjects
  studentList.value.forEach((element) => {
    let ok = true
    let xSum = 0
    let ySum = 0
    x.forEach((sub) => {
      const grade = element[sub.prop]
      if (grade === -1)ok = false
      else xSum += element[sub.prop]
    })
    y.forEach((sub) => {
      const grade = element[sub.prop]
      if (grade === -1)ok = false
      else ySum += element[sub.prop]
    })
    if (ok) {
      ret.push({
        name: element.name,
        xSum,
        ySum,
      })
    }
  })
  return ret
}
const axisType: AxisType = 'linear'
function displayScatterChart() {
  let xTitle = ''
  let yTitle = ''
  xSubjects.value.subjects.forEach(sub => xTitle += subjectPropToNameFunc(sub.prop))
  ySubjects.value.subjects.forEach(sub => yTitle += subjectPropToNameFunc(sub.prop))
  const spec = {
    type: 'common',
    series: [
      {
        type: 'scatter',
        xField: 'xSum',
        yField: 'ySum',
        point: {
          state: {
            hover: {
              scaleX: 1.2,
              scaleY: 1.2,
            },
          },
          style: {
            fillOpacity: 0.25,
          },
        },
      },
    ],
    tooltip: {
      dimension: {
        visible: false,
      },
      mark: {
        content: [
          {
            key: (d: any) => d.name,
            value: (d: any) => d.ySum,
          },
        ],
      },
    },
    crosshair: {
      yField: {
        visible: true,
        label: {
          visible: true, // label 默认关闭
        },
      },
      xField: {
        visible: true,
        label: {
          visible: true, // label 默认关闭
        },
      },
    },
    axes: [
      {
        title: {
          visible: true,
          text: yTitle,
        },
        orient: 'left',
        range: { min: 0 },
        type: axisType,
      },
      {
        title: {
          visible: true,
          text: xTitle,
        },
        orient: 'bottom',
        label: { visible: true },
        type: axisType,
      },
    ],
    data: [
      {
        id: 'data',
        values: getScatterData(),
      },
    ],
  }
  if (scatterChart === undefined) {
    scatterChart = new VChart(spec, { dom: 'scatter', animation: false })
    scatterChart.renderSync()
  }
  else {
    scatterChart.updateSpec(spec)
  }
}
const debouncedDisplayScatter = debounce(displayScatterChart, 500)
function handleSubjectsChange(value: any, obj: any) {
  obj.value = value
  debouncedDisplayScatter()
}

function getInfo() {
  studentAPI.getGrade.all()
    .then((res: any) => {
      studentList.value = []
      res.data.students.forEach((stu: StudentAPIResponse) => {
        studentList.value?.push(new StudentC(stu).toSimpleObj())
      })
      getGradeSplit()
      getSubjectChoiceCount()
      displayChart()
      displayPieChart()
      displayScatterChart()
    })
}

// Get all students without filters on loading
getInfo()

subjects.splice(0, 2)
function handleSwitchSubject() {
  displayChart()
}
</script>

<template>
  <div>
    <PageMain>
      <span style="font-size: var(--el-font-size-extra-large);font-weight: bold;">统计</span>
      <div style="display: flex; flex-direction: column;margin-top: 16px;">
        <span style="font-size: var(--el-font-size-large);">人数统计</span>
        <div style="margin-top: 8px;">
          <div id="piechart" style="height: 400px;" />
        </div>
      </div>
      <el-divider />
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: var(--el-font-size-large);">分数分布</span>
        <el-space style="flex-wrap: wrap;margin-top: 8px;">
          <el-radio-group v-model="subject" style="margin-right: 16px;" size="large" @change="handleSwitchSubject">
            <el-radio-button v-for="prop in subjects" :key="prop[0]" :label="prop[1]" :value="prop[0]" />
          </el-radio-group>
          <el-space>
            <span>区间长度</span>
            <el-input-number
              v-model="gradeSplit" style="height: 40px;" :step="1" step-strictly :min="1" @change="() => {
                getGradeSplit()
                displayChart()
              }"
            />
          </el-space>
        </el-space>
        <div>
          <span style="display: block; height: 30px; line-height: 30px;">
            共{{ (gradeInfo.get(subject)?.count ?? 0) }}条成绩，
            平均{{ ((gradeInfo.get(subject)?.sum ?? 0) / (gradeInfo.get(subject)?.count ?? 1)).toFixed(3) }}分
          </span>
        </div>
        <div>
          <div id="histogram" style="height: 400px;" />
        </div>
      </div>
      <el-divider />
      <div style="display: flex; flex-direction: column;">
        <span style="font-size: var(--el-font-size-large);">分数关系</span>
        <el-space style="margin-top: 8px;">
          <div>
            <span>横轴：</span>
            <SelectSubject
              :obj="xSubjects"
              :on-change="(value: any) => handleSubjectsChange(value, xSubjects)"
              style="width: 200px;"
            />
          </div>
          <div>
            <span>纵轴：</span>
            <SelectSubject
              :obj="ySubjects"
              :on-change="(value: any) => handleSubjectsChange(value, ySubjects)"
              style="width: 200px;"
            />
          </div>
        </el-space>
        <div>
          <div id="scatter" style="height: 400px;" />
        </div>
      </div>
    </PageMain>
  </div>
</template>
