if (Array.isArray(networkAdapters)) {
  for (key in networkAdapters) {
    adapter = networkAdapters[key]

    if (adapter.LinkRateLimit.Enable == 0) {
      return
    } //для наглядности
    if (
      adapter.LinkRateLimit.Enable == 1 &&
      adapter.LinkRateLimit.TxBps +
        adapter.LinkRateLimit.RxBps +
        adapter.LinkRateLimit.TxLossPpm +
        adapter.LinkRateLimit.RxLossPpm +
        adapter.LinkRateLimit.TxDelayMs +
        adapter.LinkRateLimit.RxDelayMs !=
        0
    ) {
      return
    }

    if (adapter.LinkRateLimit.Enable == 1) {
      markBullet('CurrentVm', icons['network conditioner'])
    }
  }
}
