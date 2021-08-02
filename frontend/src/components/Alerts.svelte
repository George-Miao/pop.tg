<script lang="ts">
  const alerts: string[] = []
</script>

<div class="alerts">
  {#each alerts as alert}
    <div class="alert">
      {alert}
    </div>
  {/each}
</div>

<style>
  .alerts {
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
  }

  .alert {
  }
</style>
