A non-blocking toast notification system backed by `sonner`.

Toasts are shown **imperatively** via `dispatchShowToast(dispatch, event)` from any
Pihanga event handler. Register the Toast card in your layout tree **once**
(typically alongside `PageWithNavbar`) to enable toast display globally.

Supports `success`, `error`, `info`, `warning`, and `default` variants.
