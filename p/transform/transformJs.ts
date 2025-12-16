import { template, traverse } from "@babel/core";
import generate from "@babel/generator";
import { Node } from "@babel/types";
import {
  convertChineseToStringTemplate,
  hasChinese
} from "../helper/convertAndExtract";

export function transformText(ast: Node | false, prefix = "") {
  const root = {
    type: "File",
    program: ast
  };
  traverse(root, {
    StringLiteral(path) {
      if (hasChinese(path.node.value)) {
        const buildCode = template.ast(
          "`" + convertChineseToStringTemplate(path.node.value, prefix) + "`"
        );
        path.replaceWith(buildCode.expression);
        path.skip();
      }
    }
  });
  return generate(root as any).code;
}
