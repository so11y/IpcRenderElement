import { parse as vueParse, babelParse, MagicString } from "@vue/compiler-sfc";
import { createFilter, Plugin, ResolvedConfig } from "vite";
import { CacheContext } from "./cache";
import { transformText } from "./transform/transformJs";
import { debounce } from "lodash";
import { transformVue } from "./transform/transformVue";
import { basename, extname } from "path";

export default function (): Plugin[] {
  const jsFilter = createFilter(
    /.(js|ts|tsx)$/,
    /node_modules|_i18_81i_|\?vue&type=script/
  );
  const vueFilter = createFilter(/.(vue)$/, /node_modules|_i18_81i_/);
  const i18FileFilter = createFilter(
    /\/_i18_81i_\/([^/]*)(\.js)?$/,
    /node_modules/
  );

  let config: ResolvedConfig;
  const selfMode = {};
  const writeI18File = debounce(
    async () => await CacheContext.outputFile(),
    500
  );

  return [
    {
      name: "vite-transform-jsI18",
      transform: {
        order: "pre",
        async handler(code, id) {
          if (!jsFilter(id)) {
            return;
          }
          const { hasChinese, drop } = await CacheContext.ready(id, code);
          if (!hasChinese) {
            return;
          }
          const ast = babelParse(code, {
            sourceType: "module"
          });
          if (!ast) {
            return;
          }
          return drop(transformText(ast, "window."));
        }
      }
    },
    {
      name: "vite-transform-vueI18",
      configResolved(_config) {
        config = _config;
      },
      transform: {
        order: "pre",
        async handler(code, id) {
          if (!vueFilter(id)) {
            return;
          }
          const { hasChinese, drop } = await CacheContext.ready(id, code);
          if (!hasChinese) {
            return;
          }
          const { descriptor } = vueParse(code);
          if (!descriptor) {
            return;
          }
          return drop(transformVue(descriptor.template.ast, code));
        }
      }
    },
    {
      name: "vite-transform-i18Build",
      config() {
        return {
          esbuild: {
            charset: "utf8"
          }
        };
      },
      moduleParsed(info) {
        console.log(info, "--");
      },
      async buildStart() {
        await CacheContext.initCache();
      },
      resolveId: {
        order: "pre",
        async handler(id) {
          if (i18FileFilter(id)) {
            if (config.mode === "production") {
              const name = basename(id);
              const fileName = `${name}.js`;
              const referenceId = this.emitFile({
                type: "asset",
                name: `${name}.js`
              });
              const resolveId = `${referenceId}_${fileName}`;
              selfMode[`/${resolveId}`] = {
                referenceId,
                exportName: name.replace(extname(name), "")
              };
              return {
                id: `/${resolveId}`,
                external: "absolute"
              };
            }
          }
        }
      },
      async renderStart() {
        await CacheContext.awaitTranslate;
        writeI18File();
        const cover = CacheContext.coverToFile();
        Object.keys(selfMode).forEach((id) => {
          const { exportName, referenceId } = selfMode[id];
          this.setAssetSource(referenceId, cover[exportName]);
        });
      },
      renderChunk(_code, chunk) {
        const modules = chunk.imports.filter((id) => selfMode[id]);
        if (modules.length) {
          const code = new MagicString(_code);
          modules.forEach((id) => {
            const fileName = this.getFileName(selfMode[id].referenceId);
            code.replace(id, `/${fileName}`);
          });
          return code.toString();
        }
      }
    }
  ];
}
