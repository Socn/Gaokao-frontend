<route lang="yaml">
meta:
  title: 用户管理
</route>

<script setup lang="ts">
import userAPI from '../../api/modules/user'

defineOptions({
  name: 'Users',
})

const users = ref<{ name: string, role: boolean }[]>([])

let changes: boolean[] = []
const changeCount = ref(0)

function getUserList() {
  userAPI.getUsers().then((res) => {
    users.value = res.data.users
    users.value.forEach((value) => {
      value.role = Boolean(value.role)
    })
  })
}
getUserList()

const addUserVisible = ref(false)
const addUserInfo = ref({ name: '', password: '', role: false })
function handleAddUser() {
  userAPI.addUser(addUserInfo.value.name, addUserInfo.value.password, addUserInfo.value.role).then(() => {
    addUserVisible.value = false
    getUserList()
  })
}

function handleCheckboxChange(index: any) {
  changes[index] = !changes[index]
  if (changes[index])changeCount.value++
  else changeCount.value--
}

function editUserRole() {
  let cnt = 0
  changes.forEach((v, index) => {
    if (v === true) {
      userAPI.editUser(users.value[index].name, Number(users.value[index].role)).finally(() => {
        cnt++
        if (cnt === changeCount.value) {
          getUserList()
          changeCount.value = 0
          changes = []
        }
      })
    }
  })
}

const confirmDelete = ref(false)
const deleteName = ref<string>('')
function handleConfirmDelete() {
  userAPI.deleteUser(deleteName.value).then(() => {
    confirmDelete.value = false
    getUserList()
  })
}
</script>

<template>
  <PageMain>
    <el-dialog
      v-model="addUserVisible" title="添加用户" width="300" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false" :before-close="() => addUserInfo = { name: '', password: '', role: false } "
    >
      <div v-if="addUserVisible">
        <div class="mb-4 flex gap-2">
          <span style=" display: block;width: 55px; height: 32px; line-height: 32px;">登录名</span>
          <el-input v-model="addUserInfo.name" />
        </div>
        <div class="mb-4 flex gap-2">
          <span style=" display: block;width: 35px; height: 32px; line-height: 32px;">密码</span>
          <el-input
            v-model="addUserInfo.password"
            type="password"
            show-password
          />
        </div>
        <div class="mb-4 flex gap-2">
          <span style=" display: block;width: 90px; height: 32px; line-height: 32px;">是否为管理员</span>
          <el-checkbox v-model="addUserInfo.role" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="addUserVisible = false">
            取消
          </ElButton>
          <ElButton
            type="primary"
            :disabled="addUserInfo.name === '' || addUserInfo.password === ''"
            @click="handleAddUser"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="confirmDelete" title="确定删除该用户？" width="300" style="color: black;"
      :close-on-click-modal="false" :close-on-press-escape="false"
    >
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="confirmDelete = false">
            取消
          </ElButton>
          <ElButton
            type="danger"
            @click="handleConfirmDelete"
          >
            确定
          </ElButton>
        </div>
      </template>
    </el-dialog>
    <span style="display: block;height: 40px;font-size: var(--el-font-size-extra-large);">用户列表</span>
    <el-button style="position: absolute; top: 24px; right: 24px;" type="primary" @click="addUserVisible = true">
      添加用户
    </el-button>
    <el-table :data="users" style="width: 100%;">
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column label="是否为管理员" width="150">
        <template #default="scope">
          <div style="display: flex; align-items: center;">
            <span v-if="scope.row.name === 'admin'">是</span>
            <el-checkbox v-if="scope.row.name !== 'admin'" v-model="users[scope.$index].role" @change="handleCheckboxChange(scope.$index)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.name !== 'admin'" plain type="danger"
            @click="() => {
              confirmDelete = true;
              deleteName = scope.row.name
            }"
          >
            删除该用户
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button v-if="changeCount !== 0" plain type="primary" style="margin-top: 8px;" @click="editUserRole">
      确认{{ changeCount }}条修改
    </el-button>
  </PageMain>
</template>
