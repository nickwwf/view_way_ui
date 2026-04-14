<template>
  <div class="realtime-task">
    <div class="task-header">
      <h1>实时任务</h1>
    </div>
    
    <div class="filter-section">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="任务应用">
          <el-select v-model="filterForm.taskApp" placeholder="请选择">
            <el-option label="选项1" value="1"></el-option>
            <el-option label="选项2" value="2"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="任务ID">
          <el-input v-model="filterForm.taskId" placeholder="请输入"></el-input>
        </el-form-item>
        
        <el-form-item label="任务时间">
          <el-date-picker
            v-model="filterForm.taskTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            placeholder="请选择"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="设备ID">
          <el-input v-model="filterForm.deviceId" placeholder="请输入"></el-input>
        </el-form-item>
        
        <el-form-item label="任务类型">
          <el-select v-model="filterForm.taskType" placeholder="请选择">
            <el-option label="选项1" value="1"></el-option>
            <el-option label="选项2" value="2"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="任务状态">
          <el-select v-model="filterForm.taskStatus" placeholder="请选择">
            <el-option label="进行中" value="1"></el-option>
            <el-option label="已完成" value="2"></el-option>
            <el-option label="已失败" value="3"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="task-list-section">
      <h2>任务列表</h2>
      <div class="task-list">
        <div class="task-item" v-for="(item, index) in paginatedTaskList" :key="index">
          <div class="task-image">
            <img :src="item.image" :alt="item.title" />
          </div>
          <div class="task-item-info">
            <div class="task-item-count">清除数: {{ item.count }}</div>
            <div class="task-item-time">{{ item.time }}</div>
            <div class="task-item-status">{{ item.status }}</div>
            <div class="task-item-type">{{ item.type }}</div>
          </div>
        </div>
      </div>
      
      <div class="pagination-section">
        <div class="pagination-info">
          第 {{ pagination.currentPage }} 页/共 {{ totalPages }} 页 共154条
        </div>
        <div class="pagination-controls">
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="prev, pager, next, jumper"
            :total="totalItems"
          ></el-pagination>
          <div class="page-size-select">
            <el-select v-model="pagination.pageSize" @change="handlePageSizeChange" size="small">
              <el-option label="10条" value="10"></el-option>
              <el-option label="20条" value="20"></el-option>
              <el-option label="50条" value="50"></el-option>
              <el-option label="100条" value="100"></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="start-button">
      <el-button type="primary" circle size="large" @click="handleStart">开始</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RealtimeTask',
  data() {
    return {
      filterForm: {
        taskApp: '',
        taskId: '',
        taskTime: '',
        deviceId: '',
        taskType: '',
        taskStatus: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 20
      },
      totalItems: 154,
      taskList: [
        {
          title: '清理任务1',
          count: 11,
          time: '2026-03-11 16:00:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20document%20icon%20with%20person%20on%20top%20of%20buildings%2C%20minimalist%20design&image_size=landscape_4_3'
        },
        {
          title: '清理任务2',
          count: 21,
          time: '2026-03-11 16:00:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aerial%20view%20of%20road%20and%20buildings%2C%20drone%20photography&image_size=landscape_4_3'
        },
        {
          title: '清理任务3',
          count: 6,
          time: '2026-03-11 16:00:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roof%20top%20view%20of%20buildings%2C%20aerial%20photography&image_size=landscape_4_3'
        },
        {
          title: '清理任务4',
          count: 0,
          time: '2026-03-11 16:00:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=urban%20area%20view%20with%20roads%20and%20buildings%2C%20aerial%20photography&image_size=landscape_4_3'
        },
        {
          title: '清理任务5',
          count: 2,
          time: '2026-03-11 15:58:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=river%20and%20landscape%20view%2C%20aerial%20photography&image_size=landscape_4_3'
        },
        {
          title: '清理任务6',
          count: 1,
          time: '2026-03-11 15:50:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=construction%20site%20view%2C%20aerial%20photography&image_size=landscape_4_3'
        },
        {
          title: '清理任务7',
          count: 0,
          time: '2026-03-11 15:26:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20document%20icon%20with%20person%20on%20top%20of%20buildings%2C%20minimalist%20design&image_size=landscape_4_3'
        },
        {
          title: '清理任务8',
          count: 0,
          time: '2026-03-11 15:21:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20document%20icon%20with%20person%20on%20top%20of%20buildings%2C%20minimalist%20design&image_size=landscape_4_3'
        },
        {
          title: '清理任务9',
          count: 6,
          time: '2026-03-11 15:19:00',
          status: '已结束',
          type: '标准车',
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coastal%20area%20view%20with%20rocks%20and%20water%2C%20aerial%20photography&image_size=landscape_4_3'
        }
      ]
    }
  },
  computed: {
    paginatedTaskList() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      return this.taskList.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.pagination.pageSize)
    }
  },
  methods: {
    handleSearch() {
      console.log('查询', this.filterForm)
    },
    handleReset() {
      this.filterForm = {
        taskApp: '',
        taskId: '',
        taskTime: '',
        deviceId: '',
        taskType: '',
        taskStatus: ''
      }
    },
    handleAdd() {
      console.log('添加任务')
    },
    handleStart() {
      console.log('开始任务')
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page
    },
    handlePageSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
    }
  }
}
</script>

<style scoped>
.realtime-task {
  padding: 20px;
  position: relative;
  min-height: 600px;
}

.task-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.filter-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.task-list-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.task-list-section h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.task-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.task-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-item-info {
  padding: 12px;
  background: #fafafa;
}

.task-item-count {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.task-item-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.task-item-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-right: 8px;
  background: #f6ffed;
  color: #52c41a;
}

.task-item-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: #f5f5f5;
  color: #666;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-size-select .el-select {
  width: 80px;
}

.start-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
}

.start-button .el-button {
  width: 60px;
  height: 60px;
  background: #ff4d4f;
  border-color: #ff4d4f;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-button .el-button:hover {
  background: #ff7875;
  border-color: #ff7875;
}

@media screen and (max-width: 1200px) {
  .task-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 992px) {
  .task-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .task-list {
    grid-template-columns: 1fr;
  }
  
  .pagination-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>