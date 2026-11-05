{{- if .IsAdd }}
// 新增表单中增加如下代码
{{- range .Fields}}
          {{- if .Form}}
<el-form-item label="{{.FieldDesc}}:"  prop="{{.FieldJson}}" >
          {{- if .CheckDataSource}}
    <el-select {{if eq .DataSource.Association 2}} multiple {{ end }} v-model="formData.{{.FieldJson}}" placeholder="请选择{{.FieldDesc}}" style="width:100%" :clearable="{{.Clearable}}" >
        <el-option v-for="(item,key) in dataSource.{{.FieldJson}}" :key="key" :label="item.label" :value="item.value" />
    </el-select>
          {{- else }}
          {{- if eq .FieldType "bool" }}
    <el-switch v-model="formData.{{.FieldJson}}" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否" clearable ></el-switch>
          {{- end }}
          {{- if eq .FieldType "string" }}
          {{- if .DictType}}
    <el-select {{if eq .FieldType "array"}}multiple {{end}}v-model="formData.{{ .FieldJson }}" placeholder="请选择{{.FieldDesc}}" style="width:100%" :clearable="{{.Clearable}}" >
        <el-option v-for="(item,key) in {{ .DictType }}Options" :key="key" :label="item.label" :value="item.value" />
    </el-select>
          {{- else }}
    <el-input v-model="formData.{{.FieldJson}}" :clearable="{{.Clearable}}"  placeholder="请输入{{.FieldDesc}}" />
          {{- end }}
          {{- end }}
          {{- if eq .FieldType "richtext" }}
    <RichEdit v-model="formData.{{.FieldJson}}"/>
          {{- end }}
          {{- if eq .FieldType "json" }}
    // 此字段为json结构，可以前端自行控制展示和数据绑定模式 需绑定json的key为 formData.{{.FieldJson}} 后端会按照json的类型进行存取
    {{"{{"}} formData.{{.FieldJson}} {{"}}"}}
          {{- end }}
           {{- if eq .FieldType "array" }}
    <ArrayCtrl v-model="formData.{{ .FieldJson }}" editable/>
           {{- end }}
          {{- if eq .FieldType "int" }}
    <el-input v-model.number="formData.{{ .FieldJson }}" :clearable="{{.Clearable}}" placeholder="请输入{{.FieldDesc}}" />
          {{- end }}
          {{- if eq .FieldType "time.Time" }}
    <el-date-picker v-model="formData.{{ .FieldJson }}" type="date" style="width:100%" placeholder="选择日期" :clearable="{{.Clearable}}"  />
          {{- end }}
          {{- if eq .FieldType "float64" }}
    <el-input-number v-model="formData.{{ .FieldJson }}"  style="width:100%" :precision="2" :clearable="{{.Clearable}}"  />
          {{- end }}
          {{- if eq .FieldType "enum" }}
    <el-select v-model="formData.{{ .FieldJson }}" placeholder="请选择{{.FieldDesc}}" style="width:100%" :clearable="{{.Clearable}}" >
       <el-option v-for="item in [{{.DataTypeLong}}]" :key="item" :label="item" :value="item" />
    </el-select>
          {{- end }}
          {{- if eq .FieldType "picture" }}
    <SelectImage
     v-model="formData.{{ .FieldJson }}"
     file-type="image"
    />
          {{- end }}
          {{- if eq .FieldType "pictures" }}
    <SelectImage
     multiple
     v-model="formData.{{ .FieldJson }}"
     file-type="image"
     />
          {{- end }}
          {{- if eq .FieldType "video" }}
    <SelectImage
    v-model="formData.{{ .FieldJson }}"
    file-type="video"
    />
           {{- end }}
          {{- if eq .FieldType "file" }}
    <SelectFile v-model="formData.{{ .FieldJson }}" />
          {{- end }}
          {{- end }}
</el-form-item>
          {{- end }}
          {{- end }}

// 字典增加如下代码
    {{- range $index, $element := .DictTypes}}
const {{ $element }}Options = ref([])
    {{- end }}

// 将以下字典加载加入现有初始化的 try 块；失败时显示原因并禁止提交。

{{- range $index, $element := .DictTypes }}
    {{ $element }}Options.value = await getDictFunc('{{$element}}')
{{- end }}

// 基础formData结构增加如下字段
{{- range .Fields}}
          {{- if .Form}}
            {{- if eq .FieldType "bool" }}
{{.FieldJson}}: false,
            {{- end }}
            {{- if eq .FieldType "string" }}
{{.FieldJson}}: '',
            {{- end }}
            {{- if eq .FieldType "richtext" }}
{{.FieldJson}}: '',
            {{- end }}
            {{- if eq .FieldType "int" }}
{{.FieldJson}}: {{- if or .DataSource}} undefined{{ else }} 0{{- end }},
            {{- end }}
            {{- if eq .FieldType "time.Time" }}
{{.FieldJson}}: new Date(),
            {{- end }}
            {{- if eq .FieldType "float64" }}
{{.FieldJson}}: 0,
            {{- end }}
            {{- if eq .FieldType "picture" }}
{{.FieldJson}}: "",
            {{- end }}
            {{- if eq .FieldType "video" }}
{{.FieldJson}}: "",
            {{- end }}
            {{- if eq .FieldType "pictures" }}
{{.FieldJson}}: [],
            {{- end }}
            {{- if eq .FieldType "file" }}
{{.FieldJson}}: [],
            {{- end }}
            {{- if eq .FieldType "json" }}
{{.FieldJson}}: {},
            {{- end }}
            {{- if eq .FieldType "array" }}
{{.FieldJson}}: [],
            {{- end }}
          {{- end }}
        {{- end }}
// 验证规则中增加如下字段

{{- range .Fields }}
        {{- if .Form }}
            {{- if eq .Require true }}
{{.FieldJson }} : [{
    required: true,
    message: '{{ .ErrorText }}',
    trigger: ['input','blur'],
},
               {{- if eq .FieldType "string" }}
{
    whitespace: true,
    message: '不能只输入空格',
    trigger: ['input', 'blur'],
}
              {{- end }}
],
            {{- end }}
        {{- end }}
    {{- end }}

{{- if .HasDataSource }}
// 请引用
get{{.StructName}}DataSource,

//  获取数据源
const dataSource = ref([])
const getDataSourceFunc = async()=>{
  const res = await get{{.StructName}}DataSource()
  if (res.code === 0) {
    dataSource.value = res.data
  }
}
getDataSourceFunc()
{{- end }}
{{- else }}
{{- if not .OnlyTemplate }}
<template>
  <div>
    <div class="gva-form-box">
      <el-alert v-if="initError" type="error" :closable="false" class="mb-3">
        <template #title>{{"{{"}} initError {{"}}"}}</template>
        <el-button link type="primary" :loading="initLoading" @click="init">重新加载</el-button>
      </el-alert>
      <el-form :disabled="initLoading || !!initError" :model="formData" ref="elFormRef" label-position="right" :rules="rule" label-width="80px">
        {{- if .IsTree }}
          <el-form-item label="父节点:" prop="parentID" >
              <el-tree-select
                  v-model="formData.parentID"
                  :data="[rootNode,...tableData]"
                  check-strictly
                  :render-after-expand="false"
                  :props="defaultProps"
                  clearable
                  style="width: 240px"
                  placeholder="根节点"
              />
          </el-form-item>
        {{- end }}
      {{- range .Fields}}
      {{- if .Form }}
        <el-form-item label="{{.FieldDesc}}:" prop="{{.FieldJson}}">
       {{- if .CheckDataSource}}
        <el-select {{if eq .DataSource.Association 2}} multiple {{ end }} v-model="formData.{{.FieldJson}}" placeholder="请选择{{.FieldDesc}}" style="width:100%" :clearable="{{.Clearable}}" >
          <el-option v-for="(item,key) in dataSource.{{.FieldJson}}" :key="key" :label="item.label" :value="item.value" />
        </el-select>
       {{- else }}
      {{- if eq .FieldType "bool" }}
          <el-switch v-model="formData.{{.FieldJson}}" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否" clearable ></el-switch>
      {{- end }}
      {{- if eq .FieldType "string" }}
      {{- if .DictType}}
           <el-select {{if eq .FieldType "array"}}multiple {{end}}v-model="formData.{{ .FieldJson }}" placeholder="请选择{{.FieldDesc}}" style="width:100%" :clearable="{{.Clearable}}" >
              <el-option v-for="(item,key) in {{ .DictType }}Options" :key="key" :label="item.label" :value="item.value" />
           </el-select>
      {{- else }}
          <el-input v-model="formData.{{.FieldJson}}" :clearable="{{.Clearable}}"  placeholder="请输入{{.FieldDesc}}" />
      {{- end }}
      {{- end }}
      {{- if eq .FieldType "richtext" }}
          <RichEdit v-model="formData.{{.FieldJson}}"/>
      {{- end }}
      {{- if eq .FieldType "int" }}
          <el-input v-model.number="formData.{{ .FieldJson }}" :clearable="{{.Clearable}}" placeholder="请输入" />
      {{- end }}
      {{- if eq .FieldType "time.Time" }}
          <el-date-picker v-model="formData.{{ .FieldJson }}" type="date" placeholder="选择日期" :clearable="{{.Clearable}}"></el-date-picker>
      {{- end }}
      {{- if eq .FieldType "float64" }}
          <el-input-number v-model="formData.{{ .FieldJson }}" :precision="2" :clearable="{{.Clearable}}"></el-input-number>
      {{- end }}
      {{- if eq .FieldType "enum" }}
        <el-select v-model="formData.{{ .FieldJson }}" placeholder="请选择" style="width:100%" :clearable="{{.Clearable}}">
          <el-option v-for="item in [{{ .DataTypeLong }}]" :key="item" :label="item" :value="item" />
        </el-select>
      {{- end }}
       {{- if eq .FieldType "picture" }}
          <SelectImage v-model="formData.{{ .FieldJson }}" file-type="image"/>
       {{- end }}
       {{- if eq .FieldType "video" }}
          <SelectImage v-model="formData.{{ .FieldJson }}" file-type="video"/>
       {{- end }}
       {{- if eq .FieldType "pictures" }}
           <SelectImage v-model="formData.{{ .FieldJson }}" multiple file-type="image"/>
       {{- end }}
       {{- if eq .FieldType "file" }}
          <SelectFile v-model="formData.{{ .FieldJson }}" />
       {{- end }}
       {{- if eq .FieldType "json" }}
          // 此字段为json结构，可以前端自行控制展示和数据绑定模式 需绑定json的key为 formData.{{.FieldJson}} 后端会按照json的类型进行存取
          {{"{{"}} formData.{{.FieldJson}} {{"}}"}}
       {{- end }}
       {{- if eq .FieldType "array" }}
          <ArrayCtrl v-model="formData.{{ .FieldJson }}" editable/>
       {{- end }}
       {{- end }}
       </el-form-item>
      {{- end }}
      {{- end }}
        <el-form-item>
          <el-button :loading="btnLoading" type="primary" @click="save">保存</el-button>
          <el-button type="primary" @click="back">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import {
  {{- if .HasDataSource }}
    get{{.StructName}}DataSource,
  {{- end }}
  {{- if .IsTree }}
    get{{.StructName}}List,
  {{- end }}
  create{{.StructName}},
  update{{.StructName}},
  find{{.StructName}}
} from '@/plugin/{{.Package}}/api/{{.PackageName}}'

defineOptions({
    name: '{{.StructName}}Form'
})

// 自动获取字典
import { getDictFunc } from '@/utils/format'
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
{{- if .HasPic }}
// 图片选择组件
import SelectImage from '@/components/selectImage/selectImage.vue'
{{- end }}

{{- if .HasFile }}
// 文件选择组件
import SelectFile from '@/components/selectFile/selectFile.vue'
{{- end }}

{{- if .HasRichText }}
// 富文本组件
import RichEdit from '@/components/richtext/rich-edit.vue'
{{- end }}

{{- if .HasArray}}
// 数组控制组件
import ArrayCtrl from '@/components/arrayCtrl/arrayCtrl.vue'
{{- end }}


const route = useRoute()
const router = useRouter()

{{- if .IsTree }}
const tableData = ref([])

const defaultProps = {
  children: "children",
  label: "{{ .TreeJson }}",
  value: "{{ .PrimaryField.FieldJson }}"
}

const rootNode = {
  {{ .PrimaryField.FieldJson }}: 0,
  {{ .TreeJson }}: '根节点',
  children: []
}

const getTableData = async() => {
  const table = await get{{.StructName}}List()
  if (table.code !== 0) throw new Error(table.msg || '父节点加载失败')
  if (table.data !== null && !Array.isArray(table.data)) throw new Error('父节点响应格式错误')
  // BuildTree 在无根节点时返回 null。
  tableData.value = table.data === null ? [] : table.data
}

{{- end }}

// 提交按钮loading
const btnLoading = ref(false)

const type = ref('')
const initLoading = ref(true)
const initError = ref('')
    {{- range $index, $element := .DictTypes}}
const {{ $element }}Options = ref([])
    {{- end }}
const formData = ref({
        {{- if .IsTree }}
            parentID: undefined,
        {{- end }}
        {{- range .Fields}}
          {{- if .Form }}
            {{- if eq .FieldType "bool" }}
            {{.FieldJson}}: false,
            {{- end }}
            {{- if eq .FieldType "string" }}
            {{.FieldJson}}: '',
            {{- end }}
            {{- if eq .FieldType "richtext" }}
            {{.FieldJson}}: '',
            {{- end }}
            {{- if eq .FieldType "int" }}
            {{.FieldJson}}: {{- if or .DataSource }} undefined{{ else }} 0{{- end }},
            {{- end }}
            {{- if eq .FieldType "time.Time" }}
            {{.FieldJson}}: new Date(),
            {{- end }}
            {{- if eq .FieldType "float64" }}
            {{.FieldJson}}: 0,
            {{- end }}
            {{- if eq .FieldType "picture" }}
            {{.FieldJson}}: "",
            {{- end }}
            {{- if eq .FieldType "video" }}
            {{.FieldJson}}: "",
            {{- end }}
            {{- if eq .FieldType "pictures" }}
            {{.FieldJson}}: [],
            {{- end }}
            {{- if eq .FieldType "file" }}
            {{.FieldJson}}: [],
            {{- end }}
            {{- if eq .FieldType "json" }}
            {{.FieldJson}}: {},
            {{- end }}
            {{- if eq .FieldType "array" }}
            {{.FieldJson}}: [],
            {{- end }}
          {{- end }}
        {{- end }}
        })
// 验证规则
const rule = reactive({
    {{- range .Fields }}
            {{- if eq .Require true }}
               {{.FieldJson }} : [{
                   required: true,
                   message: '{{ .ErrorText }}',
                   trigger: ['input','blur'],
               }],
            {{- end }}
    {{- end }}
})

const elFormRef = ref()

{{- if .HasDataSource }}
  const dataSource = ref([])
  const getDataSourceFunc = async()=>{
    const res = await get{{.StructName}}DataSource()
    if (res.code !== 0) throw new Error(res.msg || '关联数据加载失败')
    dataSource.value = res.data
  }
{{- end }}

// 初始化失败时禁止提交；读取失败不能转成创建操作。
const init = async () => {
  initLoading.value = true
  initError.value = ''
  try {
    {{- if .IsTree }}
    await getTableData()
    {{- end }}
    {{- if .HasDataSource }}
    await getDataSourceFunc()
    {{- end }}
    type.value = route.query.id ? 'update' : 'create'
    if (route.query.id) {
      const res = await find{{.StructName}}({ ID: route.query.id })
      if (res.code !== 0) throw new Error(res.msg || '记录加载失败')
      formData.value = res.data
    }
    {{- if .DictTypes }}
    [{{range $index, $element := .DictTypes}}{{if $index}}, {{end}}{{ $element }}Options.value{{end}}] = await Promise.all([
      {{- range $index, $element := .DictTypes }}
      getDictFunc('{{$element}}'),
      {{- end }}
    ])
    {{- end }}
  } catch (error) {
    initError.value = error.message
  } finally {
    initLoading.value = false
  }
}

init()

const save = async () => {
  if (btnLoading.value || initLoading.value || initError.value) return
  btnLoading.value = true
  try {
    const valid = await new Promise((resolve) => elFormRef.value.validate(resolve))
    if (!valid) return
    let res
    if (type.value === 'create') {
      res = await create{{.StructName}}(formData.value)
    } else if (type.value === 'update') {
      res = await update{{.StructName}}(formData.value)
    } else {
      throw new Error('表单操作类型无效')
    }
    if (res.code !== 0) throw new Error(res.msg || '保存失败')
    ElMessage({ type: 'success', message: '创建/更改成功' })
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    btnLoading.value = false
  }
}

// 返回按钮
const back = () => {
    router.go(-1)
}

</script>

<style>
</style>
{{- else }}
<template>
<div>form</div>
</template>
<script setup>
</script>
<style>
</style>
{{- end }}
{{- end }}
