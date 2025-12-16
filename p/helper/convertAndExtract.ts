import { CacheContext } from "../cache";

export function hasChinese(str: string) {
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  return chineseRegex.test(str);
}

export function convertChineseToStringTemplate(str: string, per = "") {
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  return str.replace(chineseRegex, (match) => {
    return "${" + per + "$t('" + CacheContext.getByContent(match) + "')}";
  });
}

export function convertChineseToTemplate(str: string) {
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  return str.replace(chineseRegex, (match) => {
    return "{{$t('" + CacheContext.getByContent(match) + "')}}";
  });
}

export function extractChineseSegments(text: string) {
  // 匹配连续的中文字符
  const chineseRegex = /[\u4e00-\u9fa5]+/g;
  return text.match(chineseRegex) || [];
}
