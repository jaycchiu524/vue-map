<template>
  <div>
    <div class="mb-4">
      <div class="flex items-center gap-2">
        <v-btn
          prepend-icon="mdi-delete-empty"
          class="rounded p-1 mx-1"
          color="error"
          @click="bulkRemove"
          :disabled="selected.length == 0">
          Delete Selected
        </v-btn>
      </div>
    </div>
    <v-table
      id="table"
      class="tw-min-h-[300px]"
      :hover="true"
      :fixed-header="true">
      <!-- Meesage if data is empty -->
      <template v-if="props.search.length === 0">
        <tbody>
          <tr>
            <td class="text-center" colspan="100%">
              <v-alert prepend-icon="mdi-map-search-outline" class="mx-auto">
                No data
              </v-alert>
            </td>
          </tr>
        </tbody>
      </template>
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td v-for="cell in row.getVisibleCells()" :key="cell.id">
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <div class="mb-4">
      <div class="flex flex-row items-center gap-2">
        <v-pagination
          rounded="circle"
          v-model="goToPageNumber"
          @update:model-value="handlePageChange"
          :length="table.getPageCount()"></v-pagination>
      </div>
      <v-chip-group>
        <v-chip
          >Showing {{ table.getPaginationRowModel().rows.length }} /
          {{ search.length }} records</v-chip
        >
      </v-chip-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
  FlexRender,
  Table,
} from '@tanstack/vue-table'
import { h, ref, Ref } from 'vue'
import { LocationData } from '../types'
import Checkbox from './Checkbox.vue'
import Delete from './Delete.vue'
import { watch } from 'vue'

const INITIAL_PAGE_INDEX = 0

const props = defineProps({
  search: {
    type: Array as () => LocationData[],
    required: true,
  },
})
const emits = defineEmits<{
  (e: 'remove', id: string): void
  (e: 'bulkRemove', ids: string[]): void
}>()

const columnHelper = createColumnHelper<LocationData>()
const goToPageNumber = ref(INITIAL_PAGE_INDEX + 1)
const pageSizes = [10, 20, 30, 40, 50]

watch(
  () => props.search,
  () => {
    table.value = useVueTable({
      data: props.search,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    })
    handlePageChange(goToPageNumber.value)
  },
  { deep: true },
)

const selected: Ref<string[]> = ref([])
const remove = (id: string) => {
  emits('remove', id)
}
const bulkRemove = () => {
  emits('bulkRemove', selected.value)
}

const columns = [
  columnHelper.display({
    header: () => '#',
    id: 'selected',
    cell: (info) => {
      return h(Checkbox, {
        modelValue: selected.value.includes(info.row.original.id),
        'onUpdate:modelValue': (value: boolean) => {
          if (value) {
            selected.value.push(info.row.original.id)
          } else {
            selected.value = selected.value.filter(
              (item) => item !== info.row.original.id,
            )
          }
        },
      })
    },
  }),

  columnHelper.accessor('id', {
    header: () => 'ID',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('name', {
    header: () => 'Name',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('address', {
    header: () => 'Address',
    footer: (props) => props.column.id,
  }),

  columnHelper.accessor('lat', {
    header: () => 'Latitude',
    footer: (props) => props.column.id,
  }),
  columnHelper.accessor('lng', {
    header: 'Longitude',
    footer: (props) => props.column.id,
  }),
  columnHelper.display({
    header: () => 'Actions',
    id: 'actions',
    cell: (info) => {
      return h(Delete, {
        row: info.row,
        onDelete: () => remove(info.row.original.id),
      })
    },
  }),
]

const table: Ref<Table<LocationData>> = ref(
  useVueTable({
    data: props.search,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  }),
)

const handlePageChange = (page: number) => {
  table.value.setPageIndex(page - 1)
}

// const handlePageSizeChange = (value: number | null) => {
//   console.log(value)
//   if (!value) {
//     return
//   }
//   table.value.setPageSize(value)
// }
</script>
<style lang="scss" scoped>
#table {
  width: 100%;
}
tbody {
  text-align: start;
}
</style>
