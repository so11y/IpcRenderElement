import { merge } from "lodash-es";
import { inject, toRaw, useAttrs, useId, watchEffect } from "vue";

export function useColumn(options) {
  const v = useId();
  const attrs = useAttrs();
  const vListTableColumns = inject("VListTableColumns");

  const DefaultOptions = {
    disableHeaderSelect: true,
    width: "auto",
    style: {
      textAlign: "center"
    },
    ...options
  };

  watchEffect(() => {
    vListTableColumns.watchColumn({
      config: merge(DefaultOptions, toRaw(attrs)),
      useId: v
    });
  });
}
