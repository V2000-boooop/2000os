<script>
  let { message = '…' } = $props();
</script>

<div class="stub">
  <pre>{message}</pre>
</div>

<style>
  .stub {
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
    background: var(--paper);
  }
  pre {
    font-family: inherit;
    font-size: 12px;
    color: var(--mid);
    text-align: center;
    white-space: pre-wrap;
  }
</style>
