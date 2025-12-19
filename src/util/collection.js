export function append(parent, nodes) {
  if (nodes.length === 0) {
    return;
  }

  const _children = nodes.reduce((prev, next) => {
    prev.parentNode = next.parentNode = parent;
    prev.nextSibling = next;
    next.previousSibling = prev;
    return next;
  });

  if (parent._children) {
    parent._children.nextSibling = _children;
    _children.previousSibling = parent._children;
  }

  parent._children = parent._children ?? _children;
}

export function insertBefore(parent, node, anchor) {
  if (!node) {
    return;
  }
  node.parentNode = parent;
  if (!parent.children) {
    parent.children = node;
    return;
  }

  if (!anchor) {
    node.nextSibling = parent.children;
    parent.children.previousSibling = node;
    parent.children = node;
    return;
  }

  introChildren(parent, (cur) => {
    if (cur === anchor) {
      const prev = cur.previousSibling;
      prev.nextSibling = node;
      node.previousSibling = prev;

      node.nextSibling = anchor;
      anchor.previousSibling = node;
    }
  });
}

export function removeChild(parent, node) {
  introChildren(parent, (cur) => {
    if (cur === node) {
      const prev = cur.previousSibling;
      const next = cur.nextSibling;
      prev.nextSibling = next;
      next.previousSibling = prev;
    }
  });
}

export function introChildren(parent, callback) {
  let cur = parent.children;
  let index = 0;
  while (cur) {
    callback(cur, index++);
    cur = cur.nextSibling;
  }
}

export function toChildrenArray(parent, callback) {
  let cur = parent._children;
  let index = 0;
  const result = [];
  while (cur) {
    if (callback) {
      result.push(callback(cur, index++));
    } else {
      result.push(cur);
    }
    cur = cur.nextSibling;
  }
  return result;
}
