<template>
  <div class="home-container">
    <div class="main-content">
        <div class="cost-page">
          <div class="page-header">
            <h2>消耗记录</h2>
          </div>
          <CostRecordList />
        </div>
      </div>
  </div>
</template>

<script>
import CostRecordList from '@/components/CostRecordList.vue'

export default {
  name: 'Cost',
  components: {
    CostRecordList
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-page-bg);
}

/* 右侧内容 */
.main-content {
  padding: 8px;
}

.cost-page {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
</style>
