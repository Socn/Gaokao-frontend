<route lang="yaml">
meta:
  title: 学生详细
</route>

<script setup lang="ts">
import VChart from '@visactor/vchart'
import shuffle from 'lodash-es/shuffle'
import Mock from 'mockjs'
import studentAPI from '@/api/modules/student'
import { type Student, type StudentAPIResponse, StudentC } from '@/interfaces/student'
import { subjectFullscore } from '@/interfaces/subject'
import { subjectPropToNameFunc } from '@/utils/subjectPropToName'
import randomGrade from '@/utils/randomGrade'

const route = useRoute()
const router = useRouter()

// const studentNum = 5000
// const studentList: Array<StudentAPIResponse> = []

// function initStudentList() {
//   for (let i = 1; i <= studentNum; i++) {
//     const chose2 = Math.floor(Math.random() * 2)
//     const chose4 = shuffle([randomGrade(60, 100, 80, 20) * 10, randomGrade(60, 100, 80, 20) * 10, -1, -1])
//     const stu: StudentAPIResponse = {
//       name: Mock.mock('@cname'),
//       id: (i + 302111000).toString(),
//       chinese: randomGrade(50, 150, 90, 60) * 10,
//       math: randomGrade(50, 150, 80, 70) * 10,
//       english: randomGrade(50, 150, 110, 60) * 10,
//       physics: chose2 === 0 ? randomGrade(60, 100, 80, 20) * 10 : -1,
//       history: chose2 === 1 ? randomGrade(40, 100, 70, 30) * 10 : -1,
//       chemistry: chose4[0],
//       biology: chose4[1],
//       geography: chose4[2],
//       politics: chose4[3],
//     }
//     studentList.push(stu)
//   }
// }
// initStudentList()
// studentList.forEach((value) => {
//   studentAPI.addGrade(new StudentC(value))
// })

const studentInfo = ref<Student>()
const gradeInfo = ref<Array<any>>([])
const gradeInfoMap = ref<Map<any, any>>()
const subjectsList = ['chinese', 'math', 'english', 'physics', 'history', 'chemistry', 'biology', 'politics', 'geography']

onMounted(() => {
  studentAPI.getGrade.byNameId('', route.params.id?.toString() ?? '')
    .then((res: any) => {
      studentInfo.value = res.data.students[0]
      if (studentInfo.value === undefined) return
      gradeInfoMap.value = new Map(Object.entries(studentInfo.value ?? {}))
      subjectsList.forEach((subject) => {
        const v = gradeInfoMap.value?.get(subject)
        if (v === -1) {
          gradeInfoMap.value?.delete(subject)
          return
        }
        gradeInfo.value.push({
          key: subjectPropToNameFunc(subject),
          value: v,
          normalized: v / (subjectFullscore.get(subject) ?? 1),
        })
      })
      gradeInfoMap.value.delete('name')
      gradeInfoMap.value.delete('id')

      // Charts
      const radar = {
        type: 'radar',
        data: [
          {
            id: 'radarData',
            values: gradeInfo.value,
          },
        ],
        categoryField: 'key',
        valueField: 'normalized',
        outerRadius: 0.8,
        point: {
          visible: false, // disable point
        },
        area: {
          visible: true, // display area
          state: {
            // The style in the hover state of the area
            hover: {
              fillOpacity: 0.5,
            },
          },
        },
        tooltip: {
          dimension: {
            content: {
              value: (v: any) => {
                return (v.value).toString()
              },
            },
          },
        },
        line: {
          style: {
            lineWidth: 4,
          },
        },
        axes: [
          {
            orient: 'radius', // radius axis
            zIndex: 100,
            min: 0.2,
            domainLine: {
              visible: false,
            },
            label: {
              visible: false,
              space: 0,
              style: {
                textAlign: 'center',
                stroke: '#fff',
                lineWidth: 4,
              },
            },
            grid: {
              smooth: false,
              style: {
                lineDash: [0],
              },
            },
          },
          {
            orient: 'angle', // angle axis
            zIndex: 50,
            tick: {
              visible: false,
            },
            domainLine: {
              visible: false,
            },
            label: {
              space: 20,
            },
            grid: {
              style: {
                lineDash: [0],
              },
            },
          },
        ],
      }
      const vchart = new VChart(radar, { dom: 'radarChart' })
      vchart.renderSync()
    })
})
</script>

<template>
  <div>
    <PageMain>
      <el-page-header @back="router.back()">
        <template #content>
          <span class="text-large mr-3 font-600"> {{ studentInfo?.name }} </span>
          <span class="mr-2 text-sm" style="color: var(--el-text-color-regular);">
            {{ studentInfo?.id }}
          </span>
        </template>
      </el-page-header>
    </PageMain>

    <PageMain>
      <div>
        <span style="font-size: var(--el-font-size-extra-large); font-weight: bold;">成绩详细</span>
        <div style="display: flex; flex-direction: row; height: 100px;">
          <div
            v-for="(grade, index) in gradeInfoMap" :key="grade[0]"
            style="display: flex; flex-direction: column; place-items: center center; width: 16.67%; margin: auto 0;"
            :style="{ borderLeft: index === 0 ? 'unset' : '1px solid var(--el-border-color)' }"
          >
            <div>
              <span style="font-size: var(--el-font-size-large);">{{ grade[1] }}</span>
              <span style="font-size: var(--el-font-size-small);">/{{ subjectFullscore.get(grade[0]) }}</span>
            </div>
            <div>
              <span style="font-size: var(--el-font-size-base);">{{ subjectPropToNameFunc(grade[0]) }}</span>
            </div>
          </div>
        </div>
        <div>
          <div id="radarChart" style="height: 400px;" />
        </div>
      </div>
    </PageMain>
  </div>
</template>, StudentAPIResponseimport randomGrade from '@/utils/randomGrade'
import { shuffle } from 'lodash-es'
