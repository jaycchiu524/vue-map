<template>
  <v-table id="table" :key="props.searches.length" :hover="true">
    <!-- Meesage if data is empty -->
    <template v-if="props.searches.length === 0">
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
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
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
    <div class="flex items-center gap-2">
      <v-btn
        class="border rounded p-1 mx-1"
        color="error"
        @click="bulkDelete"
        :disabled="selected.length == 0">
        Delete Selected
      </v-btn>
    </div>
  </div>
  <div class="mb-4">
    <div class="flex items-center gap-2">
      <v-btn
        class="border rounded p-1 mx-1"
        @click="() => table.setPageIndex(0)"
        :disabled="!table.getCanPreviousPage()">
        First Page
      </v-btn>
      <v-btn
        class="border rounded p-1 mx-1"
        @click="() => table.previousPage()"
        :disabled="!table.getCanPreviousPage()">
        Previous
      </v-btn>
      <v-btn
        class="border rounded p-1 mx-1"
        @click="() => table.nextPage()"
        :disabled="!table.getCanNextPage()">
        Next
      </v-btn>
      <v-btn
        class="border rounded p-1 mx-1"
        @click="() => table.setPageIndex(table.getPageCount() - 1)"
        :disabled="!table.getCanNextPage()">
        Last Page
      </v-btn>
      <span class="flex items-center gap-1">
        <div>Page</div>
        <strong>
          {{ table.getState().pagination.pageIndex + 1 }} of
          {{ table.getPageCount() }}
        </strong>
      </span>
      <span class="flex items-center gap-1">
        | Go to page:
        <input
          type="number"
          :value="goToPageNumber"
          @change="handleGoToPage"
          class="border p-1 rounded w-16" />
      </span>
      <select
        :value="table.getState().pagination.pageSize"
        @change="handlePageSizeChange">
        <option :key="pageSize" :value="pageSize" v-for="pageSize in pageSizes">
          Show {{ pageSize }}
        </option>
      </select>
    </div>
    <div>Total Records: {{ table.getRowModel().rows.length }} Searches</div>
    <!-- <pre>{{ JSON.stringify(table.getState().pagination, null, 2) }}</pre> -->
  </div>
</template>

<script lang="ts" setup>
import {
  createColumnHelper,
  getCoreRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  sortingFns,
  getSortedRowModel,
  FilterFn,
  SortingFn,
  // ColumnDef,
  useVueTable,
  FlexRender,
} from '@tanstack/vue-table'
import { h, ref } from 'vue'
import { LocationData } from '../types'
import Checkbox from './Checkbox.vue'
import Delete from './Delete.vue'
import { Ref } from 'vue'
import { computed } from 'vue'
import { useSearchStore } from '@/store/search'
interface InputEvent extends Event {
  target: HTMLInputElement
}

const INITIAL_PAGE_INDEX = 0

const props = defineProps({
  searches: {
    type: Array as () => LocationData[],
    required: true,
  },
})

const data = computed(() => props.searches)
const search = useSearchStore()

const columnHelper = createColumnHelper<LocationData>()
const goToPageNumber = ref(INITIAL_PAGE_INDEX + 1)
const pageSizes = [10, 20, 30, 40, 50]

const selected: Ref<string[]> = ref([])
const bulkDelete = () => {
  confirm('Are you sure you want to delete these searches?')
  console.log(selected.value)
  search.bulkRemove(selected.value)
  selected.value = []
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
  columnHelper.group({
    header: 'Info',
    columns: [
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
    ],
  }),
  columnHelper.group({
    header: 'Geolocation',
    columns: [
      columnHelper.accessor('lat', {
        header: () => 'Latitude',
        footer: (props) => props.column.id,
      }),
      columnHelper.accessor('lng', {
        header: 'Longitude',
        footer: (props) => props.column.id,
      }),
    ],
  }),
  columnHelper.display({
    header: () => 'Actions',
    id: 'actions',
    cell: (info) => {
      return h(Delete, {
        row: info.row,
        onDelete: () => {
          confirm('Are you sure you want to delete this search?') &&
            search.remove(info.row.original.id)
        },
      })
    },
  }),
]

const table = useVueTable({
  data: data.value,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const handleGoToPage = (e: Event) => {
  const event = e as InputEvent
  if (!event.target || !event.target?.value) {
    return
  }
  const page = event.target.value ? Number(event.target.value) - 1 : 0
  goToPageNumber.value = page + 1
  table.setPageIndex(page)
}

const handlePageSizeChange = (e: Event) => {
  const event = e as InputEvent
  if (!event.target || !event.target?.value) {
    return
  }
  table.setPageSize(Number(event.target.value))
}
</script>
<style lang="scss" scoped>
#table {
  width: 100%;
  min-height: 400px;
}
tbody {
  text-align: start;
}
</style>
