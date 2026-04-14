<template>
  <div class="realtime-task">
    <h3>实时任务</h3>
    <div class="task-list">
      <div class="task-item" v-for="(item, index) in taskList" :key="index">
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
  </div>
</template>

<script>
export default {
  name: 'RealtimeTask',
  data() {
    return {
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
        }
      ]
    }
  }
}
</script>

<style scoped>
.realtime-task {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.realtime-task h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
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
  height: 120px;
  overflow: hidden;
}

.task-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-item-info {
  padding: 10px;
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
}
</style>