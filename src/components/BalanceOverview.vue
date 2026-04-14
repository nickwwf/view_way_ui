<template>
  <div class="balance-overview">
    <div class="balance-card">
      <div class="balance-icon">
        <i class="el-icon-wallet"></i>
      </div>
      <div class="balance-info">
        <div class="balance-label">账户余额</div>
        <div class="balance-amount">¥ {{ formatAmount(balance) }}</div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ todayCount }}</div>
        <div class="stat-label">今日识别</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">¥ {{ formatAmount(todayCost) }}</div>
        <div class="stat-label">今日消耗</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalCount }}</div>
        <div class="stat-label">累计识别</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">¥ {{ formatAmount(totalCost) }}</div>
        <div class="stat-label">累计消耗</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BalanceOverview',
  data() {
    return {
      balance: 12580.50,
      todayCount: 128,
      todayCost: 64.00,
      totalCount: 15234,
      totalCost: 7617.00
    }
  },
  methods: {
    formatAmount(amount) {
      return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }
}
</script>

<style scoped>
.balance-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
}

.balance-card {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.balance-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.balance-icon i {
  font-size: 28px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

@media screen and (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
