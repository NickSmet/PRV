import { A as ATTACHMENT_KEY, l as lifecycle_function_unavailable, k as attributes, m as clsx, o as ensure_array_like, p as element, q as spread_props, t as bind_props, u as derived, v as run, w as hasContext, g as getContext, j as setContext, x as getAllContexts, y as props_id, z as attr, D as stringify, e as escape_html, F as attr_class, G as attr_style } from "../../chunks/index.js";
import { clsx as clsx$1 } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { N as on } from "../../chunks/events.js";
import { computePosition, offset, shift, flip, size, arrow, hide, limitShift } from "@floating-ui/dom";
import parse from "style-to-object";
import "fast-xml-parser";
import { d as getMarkersForSubSection, s as severityToVariant } from "../../chunks/markers.js";
import "linkedom";
import { tabbable, focusable, isFocusable } from "tabbable";
function createAttachmentKey() {
  return Symbol(ATTACHMENT_KEY);
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
/**
 * @license @lucide/svelte v0.561.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const {
      name,
      color = "currentColor",
      size: size2 = 24,
      strokeWidth = 2,
      absoluteStrokeWidth = false,
      iconNode = [],
      children,
      $$slots,
      $$events,
      ...props
    } = $$props;
    $$renderer2.push(`<svg${attributes(
      {
        ...defaultAttributes,
        ...props,
        width: size2,
        height: size2,
        stroke: color,
        "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth,
        class: clsx(["lucide-icon lucide", name && `lucide-${name}`, props.class])
      },
      void 0,
      void 0,
      void 0,
      3
    )}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]-->`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></svg>`);
  });
}
function Bluetooth($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "m7 7 10 10-5 5V2l5 5L7 17" }]];
    Icon($$renderer2, spread_props([
      { name: "bluetooth" },
      /**
       * @component @name Bluetooth
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNyA3IDEwIDEwLTUgNVYybDUgNUw3IDE3IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/bluetooth
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Cable($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"
        }
      ],
      ["path", { "d": "M17 21v-2" }],
      [
        "path",
        { "d": "M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" }
      ],
      ["path", { "d": "M21 21v-2" }],
      ["path", { "d": "M3 5V3" }],
      [
        "path",
        {
          "d": "M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"
        }
      ],
      ["path", { "d": "M7 5V3" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "cable" },
      /**
       * @component @name Cable
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTcgMTlhMSAxIDAgMCAxLTEtMXYtMmEyIDIgMCAwIDEgMi0yaDJhMiAyIDAgMCAxIDIgMnYyYTEgMSAwIDAgMS0xIDF6IiAvPgogIDxwYXRoIGQ9Ik0xNyAyMXYtMiIgLz4KICA8cGF0aCBkPSJNMTkgMTRWNi41YTEgMSAwIDAgMC03IDB2MTFhMSAxIDAgMCAxLTcgMFYxMCIgLz4KICA8cGF0aCBkPSJNMjEgMjF2LTIiIC8+CiAgPHBhdGggZD0iTTMgNVYzIiAvPgogIDxwYXRoIGQ9Ik00IDEwYTIgMiAwIDAgMS0yLTJWNmExIDEgMCAwIDEgMS0xaDRhMSAxIDAgMCAxIDEgMXYyYTIgMiAwIDAgMS0yIDJ6IiAvPgogIDxwYXRoIGQ9Ik03IDVWMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/cable
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Camera($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"
        }
      ],
      ["circle", { "cx": "12", "cy": "13", "r": "3" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "camera" },
      /**
       * @component @name Camera
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTMuOTk3IDRhMiAyIDAgMCAxIDEuNzYgMS4wNWwuNDg2LjlBMiAyIDAgMCAwIDE4LjAwMyA3SDIwYTIgMiAwIDAgMSAyIDJ2OWEyIDIgMCAwIDEtMiAySDRhMiAyIDAgMCAxLTItMlY5YTIgMiAwIDAgMSAyLTJoMS45OTdhMiAyIDAgMCAwIDEuNzU5LTEuMDQ4bC40ODktLjkwNEEyIDIgMCAwIDEgMTAuMDA0IDR6IiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/camera
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Check($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
    Icon($$renderer2, spread_props([
      { name: "check" },
      /**
       * @component @name Check
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Chevron_right($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
    Icon($$renderer2, spread_props([
      { name: "chevron-right" },
      /**
       * @component @name ChevronRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtOSAxOCA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevron-right
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Clipboard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        {
          "width": "8",
          "height": "4",
          "x": "8",
          "y": "2",
          "rx": "1",
          "ry": "1"
        }
      ],
      [
        "path",
        {
          "d": "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "clipboard" },
      /**
       * @component @name Clipboard
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI0IiB4PSI4IiB5PSIyIiByeD0iMSIgcnk9IjEiIC8+CiAgPHBhdGggZD0iTTE2IDRoMmEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/clipboard
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Clock($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M12 6v6l4 2" }],
      ["circle", { "cx": "12", "cy": "12", "r": "10" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "clock" },
      /**
       * @component @name Clock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgNnY2bDQgMiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/clock
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Cloud($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        { "d": "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "cloud" },
      /**
       * @component @name Cloud
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTcuNSAxOUg5YTcgNyAwIDEgMSA2LjcxLTloMS43OWE0LjUgNC41IDAgMSAxIDAgOVoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/cloud
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Copy($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        {
          "width": "14",
          "height": "14",
          "x": "8",
          "y": "8",
          "rx": "2",
          "ry": "2"
        }
      ],
      [
        "path",
        {
          "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "copy" },
      /**
       * @component @name Copy
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHg9IjgiIHk9IjgiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/copy
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Cpu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M12 20v2" }],
      ["path", { "d": "M12 2v2" }],
      ["path", { "d": "M17 20v2" }],
      ["path", { "d": "M17 2v2" }],
      ["path", { "d": "M2 12h2" }],
      ["path", { "d": "M2 17h2" }],
      ["path", { "d": "M2 7h2" }],
      ["path", { "d": "M20 12h2" }],
      ["path", { "d": "M20 17h2" }],
      ["path", { "d": "M20 7h2" }],
      ["path", { "d": "M7 20v2" }],
      ["path", { "d": "M7 2v2" }],
      [
        "rect",
        { "x": "4", "y": "4", "width": "16", "height": "16", "rx": "2" }
      ],
      [
        "rect",
        { "x": "8", "y": "8", "width": "8", "height": "8", "rx": "1" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "cpu" },
      /**
       * @component @name Cpu
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjB2MiIgLz4KICA8cGF0aCBkPSJNMTIgMnYyIiAvPgogIDxwYXRoIGQ9Ik0xNyAyMHYyIiAvPgogIDxwYXRoIGQ9Ik0xNyAydjIiIC8+CiAgPHBhdGggZD0iTTIgMTJoMiIgLz4KICA8cGF0aCBkPSJNMiAxN2gyIiAvPgogIDxwYXRoIGQ9Ik0yIDdoMiIgLz4KICA8cGF0aCBkPSJNMjAgMTJoMiIgLz4KICA8cGF0aCBkPSJNMjAgMTdoMiIgLz4KICA8cGF0aCBkPSJNMjAgN2gyIiAvPgogIDxwYXRoIGQ9Ik03IDIwdjIiIC8+CiAgPHBhdGggZD0iTTcgMnYyIiAvPgogIDxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjIiIC8+CiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/cpu
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Credit_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        { "width": "20", "height": "14", "x": "2", "y": "5", "rx": "2" }
      ],
      ["line", { "x1": "2", "x2": "22", "y1": "10", "y2": "10" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "credit-card" },
      /**
       * @component @name CreditCard
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHg9IjIiIHk9IjUiIHJ4PSIyIiAvPgogIDxsaW5lIHgxPSIyIiB4Mj0iMjIiIHkxPSIxMCIgeTI9IjEwIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/credit-card
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Disc($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "12", "cy": "12", "r": "10" }],
      ["circle", { "cx": "12", "cy": "12", "r": "2" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "disc" },
      /**
       * @component @name Disc
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/disc
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function File($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
        }
      ],
      ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "file" },
      /**
       * @component @name File
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/file
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Folder_open($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "folder-open" },
      /**
       * @component @name FolderOpen
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNiAxNCAxLjUtMi45QTIgMiAwIDAgMSA5LjI0IDEwSDIwYTIgMiAwIDAgMSAxLjk0IDIuNWwtMS41NCA2YTIgMiAwIDAgMS0xLjk1IDEuNUg0YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDMuOWEyIDIgMCAwIDEgMS42OS45bC44MSAxLjJhMiAyIDAgMCAwIDEuNjcuOUgxOGEyIDIgMCAwIDEgMiAydjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/folder-open
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Folder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "folder" },
      /**
       * @component @name Folder
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMjBhMiAyIDAgMCAwIDItMlY4YTIgMiAwIDAgMC0yLTJoLTcuOWEyIDIgMCAwIDEtMS42OS0uOUw5LjYgMy45QTIgMiAwIDAgMCA3LjkzIDNINGEyIDIgMCAwIDAtMiAydjEzYTIgMiAwIDAgMCAyIDJaIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/folder
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Gamepad_2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["line", { "x1": "6", "x2": "10", "y1": "11", "y2": "11" }],
      ["line", { "x1": "8", "x2": "8", "y1": "9", "y2": "13" }],
      [
        "line",
        { "x1": "15", "x2": "15.01", "y1": "12", "y2": "12" }
      ],
      [
        "line",
        { "x1": "18", "x2": "18.01", "y1": "10", "y2": "10" }
      ],
      [
        "path",
        {
          "d": "M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "gamepad-2" },
      /**
       * @component @name Gamepad2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iNiIgeDI9IjEwIiB5MT0iMTEiIHkyPSIxMSIgLz4KICA8bGluZSB4MT0iOCIgeDI9IjgiIHkxPSI5IiB5Mj0iMTMiIC8+CiAgPGxpbmUgeDE9IjE1IiB4Mj0iMTUuMDEiIHkxPSIxMiIgeTI9IjEyIiAvPgogIDxsaW5lIHgxPSIxOCIgeDI9IjE4LjAxIiB5MT0iMTAiIHkyPSIxMCIgLz4KICA8cGF0aCBkPSJNMTcuMzIgNUg2LjY4YTQgNCAwIDAgMC0zLjk3OCAzLjU5Yy0uMDA2LjA1Mi0uMDEuMTAxLS4wMTcuMTUyQzIuNjA0IDkuNDE2IDIgMTQuNDU2IDIgMTZhMyAzIDAgMCAwIDMgM2MxIDAgMS41LS41IDItMWwxLjQxNC0xLjQxNEEyIDIgMCAwIDEgOS44MjggMTZoNC4zNDRhMiAyIDAgMCAxIDEuNDE0LjU4NkwxNyAxOGMuNS41IDEgMSAyIDFhMyAzIDAgMCAwIDMtM2MwLTEuNTQ1LS42MDQtNi41ODQtLjY4NS03LjI1OC0uMDA3LS4wNS0uMDExLS4xLS4wMTctLjE1MUE0IDQgMCAwIDAgMTcuMzIgNXoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/gamepad-2
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Hard_drive($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["line", { "x1": "22", "x2": "2", "y1": "12", "y2": "12" }],
      [
        "path",
        {
          "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        }
      ],
      ["line", { "x1": "6", "x2": "6.01", "y1": "16", "y2": "16" }],
      [
        "line",
        { "x1": "10", "x2": "10.01", "y1": "16", "y2": "16" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "hard-drive" },
      /**
       * @component @name HardDrive
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iMjIiIHgyPSIyIiB5MT0iMTIiIHkyPSIxMiIgLz4KICA8cGF0aCBkPSJNNS40NSA1LjExIDIgMTJ2NmEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJ2LTZsLTMuNDUtNi44OUEyIDIgMCAwIDAgMTYuNzYgNEg3LjI0YTIgMiAwIDAgMC0xLjc5IDEuMTF6IiAvPgogIDxsaW5lIHgxPSI2IiB4Mj0iNi4wMSIgeTE9IjE2IiB5Mj0iMTYiIC8+CiAgPGxpbmUgeDE9IjEwIiB4Mj0iMTAuMDEiIHkxPSIxNiIgeTI9IjE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/hard-drive
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Headphones($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "headphones" },
      /**
       * @component @name Headphones
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAxNGgzYTIgMiAwIDAgMSAyIDJ2M2EyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtN2E5IDkgMCAwIDEgMTggMHY3YTIgMiAwIDAgMS0yIDJoLTFhMiAyIDAgMCAxLTItMnYtM2EyIDIgMCAwIDEgMi0yaDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/headphones
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Keyboard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M10 8h.01" }],
      ["path", { "d": "M12 12h.01" }],
      ["path", { "d": "M14 8h.01" }],
      ["path", { "d": "M16 12h.01" }],
      ["path", { "d": "M18 8h.01" }],
      ["path", { "d": "M6 8h.01" }],
      ["path", { "d": "M7 16h10" }],
      ["path", { "d": "M8 12h.01" }],
      [
        "rect",
        { "width": "20", "height": "16", "x": "2", "y": "4", "rx": "2" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "keyboard" },
      /**
       * @component @name Keyboard
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgOGguMDEiIC8+CiAgPHBhdGggZD0iTTEyIDEyaC4wMSIgLz4KICA8cGF0aCBkPSJNMTQgOGguMDEiIC8+CiAgPHBhdGggZD0iTTE2IDEyaC4wMSIgLz4KICA8cGF0aCBkPSJNMTggOGguMDEiIC8+CiAgPHBhdGggZD0iTTYgOGguMDEiIC8+CiAgPHBhdGggZD0iTTcgMTZoMTAiIC8+CiAgPHBhdGggZD0iTTggMTJoLjAxIiAvPgogIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIxNiIgeD0iMiIgeT0iNCIgcng9IjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/keyboard
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Laptop($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"
        }
      ],
      ["path", { "d": "M20.054 15.987H3.946" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "laptop" },
      /**
       * @component @name Laptop
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNWEyIDIgMCAwIDEgMiAydjguNTI2YTIgMiAwIDAgMCAuMjEyLjg5N2wxLjA2OCAyLjEyN2ExIDEgMCAwIDEtLjkgMS40NUgzLjYyYTEgMSAwIDAgMS0uOS0xLjQ1bDEuMDY4LTIuMTI3QTIgMiAwIDAgMCA0IDE1LjUyNlY3YTIgMiAwIDAgMSAyLTJ6IiAvPgogIDxwYXRoIGQ9Ik0yMC4wNTQgMTUuOTg3SDMuOTQ2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/laptop
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Loader_circle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
    Icon($$renderer2, spread_props([
      { name: "loader-circle" },
      /**
       * @component @name LoaderCircle
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTJhOSA5IDAgMSAxLTYuMjE5LTguNTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/loader-circle
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Message_circle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "message-circle" },
      /**
       * @component @name MessageCircle
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi45OTIgMTYuMzQyYTIgMiAwIDAgMSAuMDk0IDEuMTY3bC0xLjA2NSAzLjI5YTEgMSAwIDAgMCAxLjIzNiAxLjE2OGwzLjQxMy0uOTk4YTIgMiAwIDAgMSAxLjA5OS4wOTIgMTAgMTAgMCAxIDAtNC43NzctNC43MTkiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/message-circle
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Mic($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M12 19v3" }],
      ["path", { "d": "M19 10v2a7 7 0 0 1-14 0v-2" }],
      [
        "rect",
        { "x": "9", "y": "2", "width": "6", "height": "13", "rx": "3" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "mic" },
      /**
       * @component @name Mic
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMTl2MyIgLz4KICA8cGF0aCBkPSJNMTkgMTB2MmE3IDcgMCAwIDEtMTQgMHYtMiIgLz4KICA8cmVjdCB4PSI5IiB5PSIyIiB3aWR0aD0iNiIgaGVpZ2h0PSIxMyIgcng9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/mic
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Minus($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [["path", { "d": "M5 12h14" }]];
    Icon($$renderer2, spread_props([
      { name: "minus" },
      /**
       * @component @name Minus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/minus
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Monitor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        { "width": "20", "height": "14", "x": "2", "y": "3", "rx": "2" }
      ],
      ["line", { "x1": "8", "x2": "16", "y1": "21", "y2": "21" }],
      ["line", { "x1": "12", "x2": "12", "y1": "17", "y2": "21" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "monitor" },
      /**
       * @component @name Monitor
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHg9IjIiIHk9IjMiIHJ4PSIyIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSIyMSIgeTI9IjIxIiAvPgogIDxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMTciIHkyPSIyMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/monitor
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Mouse($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        { "x": "5", "y": "2", "width": "14", "height": "20", "rx": "7" }
      ],
      ["path", { "d": "M12 6v4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "mouse" },
      /**
       * @component @name Mouse
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB4PSI1IiB5PSIyIiB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHJ4PSI3IiAvPgogIDxwYXRoIGQ9Ik0xMiA2djQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/mouse
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Network($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        { "x": "16", "y": "16", "width": "6", "height": "6", "rx": "1" }
      ],
      [
        "rect",
        { "x": "2", "y": "16", "width": "6", "height": "6", "rx": "1" }
      ],
      [
        "rect",
        { "x": "9", "y": "2", "width": "6", "height": "6", "rx": "1" }
      ],
      ["path", { "d": "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" }],
      ["path", { "d": "M12 12V8" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "network" },
      /**
       * @component @name Network
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB4PSIxNiIgeT0iMTYiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxIiAvPgogIDxyZWN0IHg9IjIiIHk9IjE2IiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgLz4KICA8cmVjdCB4PSI5IiB5PSIyIiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMSIgLz4KICA8cGF0aCBkPSJNNSAxNnYtM2ExIDEgMCAwIDEgMS0xaDEyYTEgMSAwIDAgMSAxIDF2MyIgLz4KICA8cGF0aCBkPSJNMTIgMTJWOCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/network
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Plane($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "plane" },
      /**
       * @component @name Plane
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTcuOCAxOS4yIDE2IDExbDMuNS0zLjVDMjEgNiAyMS41IDQgMjEgM2MtMS0uNS0zIDAtNC41IDEuNUwxMyA4IDQuOCA2LjJjLS41LS4xLS45LjEtMS4xLjVsLS4zLjVjLS4yLjUtLjEgMSAuMyAxLjNMOSAxMmwtMiAzSDRsLTEgMSAzIDIgMiAzIDEtMXYtM2wzLTIgMy41IDUuM2MuMy40LjguNSAxLjMuM2wuNS0uMmMuNC0uMy42LS43LjUtMS4yeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plane
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Printer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        }
      ],
      ["path", { "d": "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" }],
      [
        "rect",
        { "x": "6", "y": "14", "width": "12", "height": "8", "rx": "1" }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "printer" },
      /**
       * @component @name Printer
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAxOEg0YTIgMiAwIDAgMS0yLTJ2LTVhMiAyIDAgMCAxIDItMmgxNmEyIDIgMCAwIDEgMiAydjVhMiAyIDAgMCAxLTIgMmgtMiIgLz4KICA8cGF0aCBkPSJNNiA5VjNhMSAxIDAgMCAxIDEtMWgxMGExIDEgMCAwIDEgMSAxdjYiIC8+CiAgPHJlY3QgeD0iNiIgeT0iMTQiIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiByeD0iMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/printer
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Settings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
        }
      ],
      ["circle", { "cx": "12", "cy": "12", "r": "3" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "settings" },
      /**
       * @component @name Settings
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOS42NzEgNC4xMzZhMi4zNCAyLjM0IDAgMCAxIDQuNjU5IDAgMi4zNCAyLjM0IDAgMCAwIDMuMzE5IDEuOTE1IDIuMzQgMi4zNCAwIDAgMSAyLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMCAwIDMuODMxIDIuMzQgMi4zNCAwIDAgMS0yLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMC0zLjMxOSAxLjkxNSAyLjM0IDIuMzQgMCAwIDEtNC42NTkgMCAyLjM0IDIuMzQgMCAwIDAtMy4zMi0xLjkxNSAyLjM0IDIuMzQgMCAwIDEtMi4zMy00LjAzMyAyLjM0IDIuMzQgMCAwIDAgMC0zLjgzMUEyLjM0IDIuMzQgMCAwIDEgNi4zNSA2LjA1MWEyLjM0IDIuMzQgMCAwIDAgMy4zMTktMS45MTUiIC8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/settings
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Shield_alert($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        }
      ],
      ["path", { "d": "M12 8v4" }],
      ["path", { "d": "M12 16h.01" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "shield-alert" },
      /**
       * @component @name ShieldAlert
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA4Ljk1YTEgMSAwIDAgMS0uNjctLjAxQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMSAxLTFjMiAwIDQuNS0xLjIgNi4yNC0yLjcyYTEuMTcgMS4xNyAwIDAgMSAxLjUyIDBDMTQuNTEgMy44MSAxNyA1IDE5IDVhMSAxIDAgMCAxIDEgMXoiIC8+CiAgPHBhdGggZD0iTTEyIDh2NCIgLz4KICA8cGF0aCBkPSJNMTIgMTZoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/shield-alert
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Shield($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "shield" },
      /**
       * @component @name Shield
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA4Ljk1YTEgMSAwIDAgMS0uNjctLjAxQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMSAxLTFjMiAwIDQuNS0xLjIgNi4yNC0yLjcyYTEuMTcgMS4xNyAwIDAgMSAxLjUyIDBDMTQuNTEgMy44MSAxNyA1IDE5IDVhMSAxIDAgMCAxIDEgMXoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/shield
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Sliders_horizontal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M10 5H3" }],
      ["path", { "d": "M12 19H3" }],
      ["path", { "d": "M14 3v4" }],
      ["path", { "d": "M16 17v4" }],
      ["path", { "d": "M21 12h-9" }],
      ["path", { "d": "M21 19h-5" }],
      ["path", { "d": "M21 5h-7" }],
      ["path", { "d": "M8 10v4" }],
      ["path", { "d": "M8 12H3" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "sliders-horizontal" },
      /**
       * @component @name SlidersHorizontal
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgNUgzIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOUgzIiAvPgogIDxwYXRoIGQ9Ik0xNCAzdjQiIC8+CiAgPHBhdGggZD0iTTE2IDE3djQiIC8+CiAgPHBhdGggZD0iTTIxIDEyaC05IiAvPgogIDxwYXRoIGQ9Ik0yMSAxOWgtNSIgLz4KICA8cGF0aCBkPSJNMjEgNWgtNyIgLz4KICA8cGF0aCBkPSJNOCAxMHY0IiAvPgogIDxwYXRoIGQ9Ik04IDEySDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/sliders-horizontal
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Smartphone($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "rect",
        {
          "width": "14",
          "height": "20",
          "x": "5",
          "y": "2",
          "rx": "2",
          "ry": "2"
        }
      ],
      ["path", { "d": "M12 18h.01" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "smartphone" },
      /**
       * @component @name Smartphone
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHg9IjUiIHk9IjIiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNMTIgMThoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/smartphone
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Triangle_alert($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
        }
      ],
      ["path", { "d": "M12 9v4" }],
      ["path", { "d": "M12 17h.01" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "triangle-alert" },
      /**
       * @component @name TriangleAlert
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiIC8+CiAgPHBhdGggZD0iTTEyIDl2NCIgLz4KICA8cGF0aCBkPSJNMTIgMTdoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/triangle-alert
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Usb($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "10", "cy": "7", "r": "1" }],
      ["circle", { "cx": "4", "cy": "20", "r": "1" }],
      ["path", { "d": "M4.7 19.3 19 5" }],
      ["path", { "d": "m21 3-3 1 2 2Z" }],
      ["path", { "d": "M9.26 7.68 5 12l2 5" }],
      ["path", { "d": "m10 14 5 2 3.5-3.5" }],
      ["path", { "d": "m18 12 1-1 1 1-1 1Z" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "usb" },
      /**
       * @component @name Usb
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMCIgY3k9IjciIHI9IjEiIC8+CiAgPGNpcmNsZSBjeD0iNCIgY3k9IjIwIiByPSIxIiAvPgogIDxwYXRoIGQ9Ik00LjcgMTkuMyAxOSA1IiAvPgogIDxwYXRoIGQ9Im0yMSAzLTMgMSAyIDJaIiAvPgogIDxwYXRoIGQ9Ik05LjI2IDcuNjggNSAxMmwyIDUiIC8+CiAgPHBhdGggZD0ibTEwIDE0IDUgMiAzLjUtMy41IiAvPgogIDxwYXRoIGQ9Im0xOCAxMiAxLTEgMSAxLTEgMVoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/usb
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Volume_2($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        }
      ],
      ["path", { "d": "M16 9a5 5 0 0 1 0 6" }],
      ["path", { "d": "M19.364 18.364a9 9 0 0 0 0-12.728" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "volume-2" },
      /**
       * @component @name Volume2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgNC43MDJhLjcwNS43MDUgMCAwIDAtMS4yMDMtLjQ5OEw2LjQxMyA3LjU4N0ExLjQgMS40IDAgMCAxIDUuNDE2IDhIM2ExIDEgMCAwIDAtMSAxdjZhMSAxIDAgMCAwIDEgMWgyLjQxNmExLjQgMS40IDAgMCAxIC45OTcuNDEzbDMuMzgzIDMuMzg0QS43MDUuNzA1IDAgMCAwIDExIDE5LjI5OHoiIC8+CiAgPHBhdGggZD0iTTE2IDlhNSA1IDAgMCAxIDAgNiIgLz4KICA8cGF0aCBkPSJNMTkuMzY0IDE4LjM2NGE5IDkgMCAwIDAgMC0xMi43MjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/volume-2
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Volume_x($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        }
      ],
      ["line", { "x1": "22", "x2": "16", "y1": "9", "y2": "15" }],
      ["line", { "x1": "16", "x2": "22", "y1": "9", "y2": "15" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "volume-x" },
      /**
       * @component @name VolumeX
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEgNC43MDJhLjcwNS43MDUgMCAwIDAtMS4yMDMtLjQ5OEw2LjQxMyA3LjU4N0ExLjQgMS40IDAgMCAxIDUuNDE2IDhIM2ExIDEgMCAwIDAtMSAxdjZhMSAxIDAgMCAwIDEgMWgyLjQxNmExLjQgMS40IDAgMCAxIC45OTcuNDEzbDMuMzgzIDMuMzg0QS43MDUuNzA1IDAgMCAwIDExIDE5LjI5OHoiIC8+CiAgPGxpbmUgeDE9IjIyIiB4Mj0iMTYiIHkxPSI5IiB5Mj0iMTUiIC8+CiAgPGxpbmUgeDE9IjE2IiB4Mj0iMjIiIHkxPSI5IiB5Mj0iMTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/volume-x
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Webcam($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["circle", { "cx": "12", "cy": "10", "r": "8" }],
      ["circle", { "cx": "12", "cy": "10", "r": "3" }],
      ["path", { "d": "M7 22h10" }],
      ["path", { "d": "M12 22v-4" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "webcam" },
      /**
       * @component @name Webcam
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSI4IiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIC8+CiAgPHBhdGggZD0iTTcgMjJoMTAiIC8+CiAgPHBhdGggZD0iTTEyIDIydi00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/webcam
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Wifi($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M12 20h.01" }],
      ["path", { "d": "M2 8.82a15 15 0 0 1 20 0" }],
      ["path", { "d": "M5 12.859a10 10 0 0 1 14 0" }],
      ["path", { "d": "M8.5 16.429a5 5 0 0 1 7 0" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "wifi" },
      /**
       * @component @name Wifi
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjBoLjAxIiAvPgogIDxwYXRoIGQ9Ik0yIDguODJhMTUgMTUgMCAwIDEgMjAgMCIgLz4KICA8cGF0aCBkPSJNNSAxMi44NTlhMTAgMTAgMCAwIDEgMTQgMCIgLz4KICA8cGF0aCBkPSJNOC41IDE2LjQyOWE1IDUgMCAwIDEgNyAwIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/wifi
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function X($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      ["path", { "d": "M18 6 6 18" }],
      ["path", { "d": "m6 6 12 12" }]
    ];
    Icon($$renderer2, spread_props([
      { name: "x" },
      /**
       * @component @name X
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA2IDE4IiAvPgogIDxwYXRoIGQ9Im02IDYgMTIgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/x
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function Zap($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    /**
     * @license @lucide/svelte v0.561.0 - ISC
     *
     * ISC License
     *
     * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
     *
     * Permission to use, copy, modify, and/or distribute this software for any
     * purpose with or without fee is hereby granted, provided that the above
     * copyright notice and this permission notice appear in all copies.
     *
     * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
     * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
     * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
     * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
     * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
     * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
     * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
     *
     * ---
     *
     * The MIT License (MIT) (for portions derived from Feather)
     *
     * Copyright (c) 2013-2023 Cole Bemis
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     *
     */
    let { $$slots, $$events, ...props } = $$props;
    const iconNode = [
      [
        "path",
        {
          "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
        }
      ]
    ];
    Icon($$renderer2, spread_props([
      { name: "zap" },
      /**
       * @component @name Zap
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNCAxNGExIDEgMCAwIDEtLjc4LTEuNjNsOS45LTEwLjJhLjUuNSAwIDAgMSAuODYuNDZsLTEuOTIgNi4wMkExIDEgMCAwIDAgMTMgMTBoN2ExIDEgMCAwIDEgLjc4IDEuNjNsLTkuOSAxMC4yYS41LjUgMCAwIDEtLjg2LS40NmwxLjkyLTYuMDJBMSAxIDAgMCAwIDExIDE0eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/zap
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      props,
      {
        iconNode,
        children: ($$renderer3) => {
          props.children?.($$renderer3);
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
  });
}
function cn(...inputs) {
  return twMerge(clsx$1(inputs));
}
function Badge$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      class: className,
      variant = "default",
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const variantClasses = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
      muted: "border-transparent text-muted-foreground hover:bg-muted/80",
      success: "border-transparent text-success-foreground hover:bg-success/80"
    };
    const variantStyles = {
      default: "",
      secondary: "",
      destructive: "",
      outline: "",
      // NOTE: In userscript mode, host pages sometimes ship aggressive CSS resets with `!important`.
      // Inline styles normally win, but `!important` in page CSS can override them — so we mark our
      // critical pill colors as `!important` to keep badges readable.
      muted: "background-color: hsl(220 14% 85%) !important; color: hsl(220 10% 40%) !important; border-color: transparent !important;",
      success: "background-color: hsl(142 60% 50%) !important; color: hsl(0 0% 100%) !important; border-color: transparent !important;"
    };
    $$renderer2.push(`<div${attributes({
      class: clsx(cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variantClasses[variant], className)),
      style: variantStyles[variant],
      ...restProps
    })}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function Input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      class: className,
      value = "",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    $$renderer2.push(`<input${attributes(
      {
        value,
        class: clsx(cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)),
        ...restProps
      },
      void 0,
      void 0,
      void 0,
      4
    )}/>`);
    bind_props($$props, { value });
  });
}
const buttonVariants = tv({
  base: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/50 relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium whitespace-nowrap outline-hidden transition-all select-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs",
      destructive: "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 text-white shadow-2xs",
      outline: "bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 border shadow-2xs",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-2xs",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      variant = "default",
      size: size2 = "default",
      href = void 0,
      type = "button",
      loading = false,
      disabled = false,
      tabindex = 0,
      onclick,
      onClickPromise,
      class: className,
      children,
      $$slots,
      $$events,
      ...rest
    } = $$props;
    element(
      $$renderer2,
      href ? "a" : "button",
      () => {
        $$renderer2.push(`${attributes({
          ...rest,
          "data-slot": "button",
          type: href ? void 0 : type,
          href: href && !disabled ? href : void 0,
          disabled: href ? void 0 : disabled || loading,
          "aria-disabled": href ? disabled : void 0,
          role: href && disabled ? "link" : void 0,
          tabindex: href && disabled ? -1 : tabindex,
          class: clsx(cn(buttonVariants({ variant, size: size2 }), className))
        })}`);
      },
      () => {
        if (type !== void 0 && loading) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex animate-spin place-items-center justify-center">`);
          Loader_circle($$renderer2, { class: "size-4" });
          $$renderer2.push(`<!----></div> <span class="sr-only">Loading</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        children?.($$renderer2);
        $$renderer2.push(`<!---->`);
      }
    );
    bind_props($$props, { ref });
  });
}
class UseClipboard {
  constructor({ delay = 500 } = {}) {
    this.#copiedStatus = void 0;
    this.timeout = void 0;
    this.delay = delay;
  }
  #copiedStatus;
  /** Copies the given text to the users clipboard.
   *
   * ## Usage
   * ```ts
   * clipboard.copy('Hello, World!');
   * ```
   *
   * @param text
   * @returns
   */
  async copy(text) {
    if (this.timeout) {
      this.#copiedStatus = void 0;
      clearTimeout(this.timeout);
    }
    try {
      await navigator.clipboard.writeText(text);
      this.#copiedStatus = "success";
      this.timeout = setTimeout(
        () => {
          this.#copiedStatus = void 0;
        },
        this.delay
      );
    } catch {
      this.#copiedStatus = "failure";
      this.timeout = setTimeout(
        () => {
          this.#copiedStatus = void 0;
        },
        this.delay
      );
    }
    return this.#copiedStatus;
  }
  /** true when the user has just copied to the clipboard. */
  get copied() {
    return this.#copiedStatus === "success";
  }
  /**	Indicates whether a copy has occurred
   * and gives a status of either `success` or `failure`. */
  get status() {
    return this.#copiedStatus;
  }
}
function Copy_button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      text,
      icon,
      animationDuration = 500,
      variant = "ghost",
      size: size2 = "icon",
      onCopy,
      class: className,
      tabindex = -1,
      children,
      $$slots,
      $$events,
      ...rest
    } = $$props;
    const effectiveSize = size2 === "icon" && children ? "default" : size2;
    const clipboard = new UseClipboard();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Button($$renderer3, spread_props([
        rest,
        {
          variant,
          size: effectiveSize,
          tabindex,
          class: cn("flex items-center gap-2", className),
          type: "button",
          name: "copy",
          onclick: async () => {
            const status = await clipboard.copy(text);
            onCopy?.(status);
          },
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            if (clipboard.status === "success") {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<div>`);
              Check($$renderer4, { tabindex: -1 });
              $$renderer4.push(`<!----> <span class="sr-only">Copied</span></div>`);
            } else {
              $$renderer4.push("<!--[!-->");
              if (clipboard.status === "failure") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<div>`);
                X($$renderer4, { tabindex: -1 });
                $$renderer4.push(`<!----> <span class="sr-only">Failed to copy</span></div>`);
              } else {
                $$renderer4.push("<!--[!-->");
                $$renderer4.push(`<div>`);
                if (icon) {
                  $$renderer4.push("<!--[-->");
                  icon($$renderer4);
                  $$renderer4.push(`<!---->`);
                } else {
                  $$renderer4.push("<!--[!-->");
                  Copy($$renderer4, { tabindex: -1 });
                }
                $$renderer4.push(`<!--]--> <span class="sr-only">Copy</span></div>`);
              }
              $$renderer4.push(`<!--]-->`);
            }
            $$renderer4.push(`<!--]--> `);
            children?.($$renderer4);
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const CLASS_VALUE_PRIMITIVE_TYPES = ["string", "number", "bigint", "boolean"];
function isClassValue(value) {
  if (value === null || value === void 0)
    return true;
  if (CLASS_VALUE_PRIMITIVE_TYPES.includes(typeof value))
    return true;
  if (Array.isArray(value))
    return value.every((item) => isClassValue(item));
  if (typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      return false;
    return true;
  }
  return false;
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function boxWith(getter, setter) {
  const derived2 = getter();
  if (setter) {
    return {
      [BoxSymbol]: true,
      [isWritableSymbol]: true,
      get current() {
        return derived2;
      },
      set current(v) {
        setter(v);
      }
    };
  }
  return {
    [BoxSymbol]: true,
    get current() {
      return getter();
    }
  };
}
function isBox(value) {
  return isObject(value) && BoxSymbol in value;
}
function boxFrom(value) {
  if (isBox(value)) return value;
  if (isFunction$1(value)) return boxWith(value);
  return simpleBox(value);
}
function simpleBox(initialValue) {
  let current = initialValue;
  return {
    [BoxSymbol]: true,
    [isWritableSymbol]: true,
    get current() {
      return current;
    },
    set current(v) {
      current = v;
    }
  };
}
function composeHandlers(...handlers) {
  return function(e) {
    for (const handler of handlers) {
      if (!handler)
        continue;
      if (e.defaultPrevented)
        return;
      if (typeof handler === "function") {
        handler.call(this, e);
      } else {
        handler.current?.call(this, e);
      }
    }
  };
}
const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return void 0;
  return char !== char.toLowerCase();
}
function splitByCase(str) {
  const parts = [];
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = STR_SPLITTERS.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function pascalCase(str) {
  if (!str)
    return "";
  return splitByCase(str).map((p) => upperFirst(p)).join("");
}
function camelCase(str) {
  return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
  if (!css)
    return {};
  const styleObj = {};
  function iterator(name, value) {
    if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
      styleObj[pascalCase(name)] = value;
      return;
    }
    if (name.startsWith("--")) {
      styleObj[name] = value;
      return;
    }
    styleObj[camelCase(name)] = value;
  }
  parse(css, iterator);
  return styleObj;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function createParser(matcher, replacer) {
  const regex = RegExp(matcher, "g");
  return (str) => {
    if (typeof str !== "string") {
      throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
    }
    if (!str.match(regex))
      return str;
    return str.replace(regex, replacer);
  };
}
const camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
  if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) {
    throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
  }
  return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
  return styleToCSS(style).replace("\n", " ");
}
const EVENT_LIST = [
  "onabort",
  "onanimationcancel",
  "onanimationend",
  "onanimationiteration",
  "onanimationstart",
  "onauxclick",
  "onbeforeinput",
  "onbeforetoggle",
  "onblur",
  "oncancel",
  "oncanplay",
  "oncanplaythrough",
  "onchange",
  "onclick",
  "onclose",
  "oncompositionend",
  "oncompositionstart",
  "oncompositionupdate",
  "oncontextlost",
  "oncontextmenu",
  "oncontextrestored",
  "oncopy",
  "oncuechange",
  "oncut",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "ondurationchange",
  "onemptied",
  "onended",
  "onerror",
  "onfocus",
  "onfocusin",
  "onfocusout",
  "onformdata",
  "ongotpointercapture",
  "oninput",
  "oninvalid",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onlostpointercapture",
  "onmousedown",
  "onmouseenter",
  "onmouseleave",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onpaste",
  "onpause",
  "onplay",
  "onplaying",
  "onpointercancel",
  "onpointerdown",
  "onpointerenter",
  "onpointerleave",
  "onpointermove",
  "onpointerout",
  "onpointerover",
  "onpointerup",
  "onprogress",
  "onratechange",
  "onreset",
  "onresize",
  "onscroll",
  "onscrollend",
  "onsecuritypolicyviolation",
  "onseeked",
  "onseeking",
  "onselect",
  "onselectionchange",
  "onselectstart",
  "onslotchange",
  "onstalled",
  "onsubmit",
  "onsuspend",
  "ontimeupdate",
  "ontoggle",
  "ontouchcancel",
  "ontouchend",
  "ontouchmove",
  "ontouchstart",
  "ontransitioncancel",
  "ontransitionend",
  "ontransitionrun",
  "ontransitionstart",
  "onvolumechange",
  "onwaiting",
  "onwebkitanimationend",
  "onwebkitanimationiteration",
  "onwebkitanimationstart",
  "onwebkittransitionend",
  "onwheel"
];
const EVENT_LIST_SET = new Set(EVENT_LIST);
function isEventHandler(key) {
  return EVENT_LIST_SET.has(key);
}
function mergeProps(...args) {
  const result = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    if (!props)
      continue;
    for (const key of Object.keys(props)) {
      const a = result[key];
      const b = props[key];
      const aIsFunction = typeof a === "function";
      const bIsFunction = typeof b === "function";
      if (aIsFunction && typeof bIsFunction && isEventHandler(key)) {
        const aHandler = a;
        const bHandler = b;
        result[key] = composeHandlers(aHandler, bHandler);
      } else if (aIsFunction && bIsFunction) {
        result[key] = executeCallbacks(a, b);
      } else if (key === "class") {
        const aIsClassValue = isClassValue(a);
        const bIsClassValue = isClassValue(b);
        if (aIsClassValue && bIsClassValue) {
          result[key] = clsx$1(a, b);
        } else if (aIsClassValue) {
          result[key] = clsx$1(a);
        } else if (bIsClassValue) {
          result[key] = clsx$1(b);
        }
      } else if (key === "style") {
        const aIsObject = typeof a === "object";
        const bIsObject = typeof b === "object";
        const aIsString = typeof a === "string";
        const bIsString = typeof b === "string";
        if (aIsObject && bIsObject) {
          result[key] = { ...a, ...b };
        } else if (aIsObject && bIsString) {
          const parsedStyle = cssToStyleObj(b);
          result[key] = { ...a, ...parsedStyle };
        } else if (aIsString && bIsObject) {
          const parsedStyle = cssToStyleObj(a);
          result[key] = { ...parsedStyle, ...b };
        } else if (aIsString && bIsString) {
          const parsedStyleA = cssToStyleObj(a);
          const parsedStyleB = cssToStyleObj(b);
          result[key] = { ...parsedStyleA, ...parsedStyleB };
        } else if (aIsObject) {
          result[key] = a;
        } else if (bIsObject) {
          result[key] = b;
        } else if (aIsString) {
          result[key] = a;
        } else if (bIsString) {
          result[key] = b;
        }
      } else {
        result[key] = b !== void 0 ? b : a;
      }
    }
    for (const key of Object.getOwnPropertySymbols(props)) {
      const a = result[key];
      const b = props[key];
      result[key] = b !== void 0 ? b : a;
    }
  }
  if (typeof result.style === "object") {
    result.style = styleToString(result.style).replaceAll("\n", " ");
  }
  if (result.hidden === false) {
    result.hidden = void 0;
    delete result.hidden;
  }
  if (result.disabled === false) {
    result.disabled = void 0;
    delete result.disabled;
  }
  return result;
}
const SvelteMap = globalThis.Map;
function createSubscriber(_) {
  return () => {
  };
}
function onDestroyEffect(fn) {
}
function afterSleep(ms, cb) {
  return setTimeout(cb, ms);
}
function afterTick(fn) {
  tick().then(fn);
}
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
function isHTMLElement$1(node) {
  return isObject(node) && node.nodeType === ELEMENT_NODE && typeof node.nodeName === "string";
}
function isDocument(node) {
  return isObject(node) && node.nodeType === DOCUMENT_NODE;
}
function isWindow(node) {
  return isObject(node) && node.constructor?.name === "VisualViewport";
}
function isNode(node) {
  return isObject(node) && node.nodeType !== void 0;
}
function isShadowRoot(node) {
  return isNode(node) && node.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in node;
}
function contains(parent, child) {
  if (!parent || !child)
    return false;
  if (!isHTMLElement$1(parent) || !isHTMLElement$1(child))
    return false;
  const rootNode = child.getRootNode?.();
  if (parent === child)
    return true;
  if (parent.contains(child))
    return true;
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next)
        return true;
      next = next.parentNode || next.host;
    }
  }
  return false;
}
function getDocument(node) {
  if (isDocument(node))
    return node;
  if (isWindow(node))
    return node.document;
  return node?.ownerDocument ?? document;
}
function getWindow(node) {
  if (isShadowRoot(node))
    return getWindow(node.host);
  if (isDocument(node))
    return node.defaultView ?? window;
  if (isHTMLElement$1(node))
    return node.ownerDocument?.defaultView ?? window;
  return window;
}
function getActiveElement$1(rootNode) {
  let activeElement = rootNode.activeElement;
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement;
    if (el === activeElement)
      break;
    else
      activeElement = el;
  }
  return activeElement;
}
class DOMContext {
  element;
  #root = derived(() => {
    if (!this.element.current) return document;
    const rootNode = this.element.current.getRootNode() ?? document;
    return rootNode;
  });
  get root() {
    return this.#root();
  }
  set root($$value) {
    return this.#root($$value);
  }
  constructor(element2) {
    if (typeof element2 === "function") {
      this.element = boxWith(element2);
    } else {
      this.element = element2;
    }
  }
  getDocument = () => {
    return getDocument(this.root);
  };
  getWindow = () => {
    return this.getDocument().defaultView ?? window;
  };
  getActiveElement = () => {
    return getActiveElement$1(this.root);
  };
  isActiveElement = (node) => {
    return node === this.getActiveElement();
  };
  getElementById(id) {
    return this.root.getElementById(id);
  }
  querySelector = (selector) => {
    if (!this.root) return null;
    return this.root.querySelector(selector);
  };
  querySelectorAll = (selector) => {
    if (!this.root) return [];
    return this.root.querySelectorAll(selector);
  };
  setTimeout = (callback, delay) => {
    return this.getWindow().setTimeout(callback, delay);
  };
  clearTimeout = (timeoutId) => {
    return this.getWindow().clearTimeout(timeoutId);
  };
}
function attachRef(ref, onChange) {
  return {
    [createAttachmentKey()]: (node) => {
      if (isBox(ref)) {
        ref.current = node;
        run(() => onChange?.(node));
        return () => {
          if ("isConnected" in node && node.isConnected)
            return;
          ref.current = null;
          onChange?.(null);
        };
      }
      ref(node);
      run(() => onChange?.(node));
      return () => {
        if ("isConnected" in node && node.isConnected)
          return;
        ref(null);
        onChange?.(null);
      };
    }
  };
}
const defaultWindow = void 0;
function getActiveElement(document2) {
  let activeElement = document2.activeElement;
  while (activeElement?.shadowRoot) {
    const node = activeElement.shadowRoot.activeElement;
    if (node === activeElement)
      break;
    else
      activeElement = node;
  }
  return activeElement;
}
class ActiveElement {
  #document;
  #subscribe;
  constructor(options = {}) {
    const { window: window2 = defaultWindow, document: document2 = window2?.document } = options;
    if (window2 === void 0) return;
    this.#document = document2;
    this.#subscribe = createSubscriber();
  }
  get current() {
    this.#subscribe?.();
    if (!this.#document) return null;
    return getActiveElement(this.#document);
  }
}
new ActiveElement();
function isFunction(value) {
  return typeof value === "function";
}
class Context {
  #name;
  #key;
  /**
   * @param name The name of the context.
   * This is used for generating the context key and error messages.
   */
  constructor(name) {
    this.#name = name;
    this.#key = Symbol(name);
  }
  /**
   * The key used to get and set the context.
   *
   * It is not recommended to use this value directly.
   * Instead, use the methods provided by this class.
   */
  get key() {
    return this.#key;
  }
  /**
   * Checks whether this has been set in the context of a parent component.
   *
   * Must be called during component initialisation.
   */
  exists() {
    return hasContext(this.#key);
  }
  /**
   * Retrieves the context that belongs to the closest parent component.
   *
   * Must be called during component initialisation.
   *
   * @throws An error if the context does not exist.
   */
  get() {
    const context = getContext(this.#key);
    if (context === void 0) {
      throw new Error(`Context "${this.#name}" not found`);
    }
    return context;
  }
  /**
   * Retrieves the context that belongs to the closest parent component,
   * or the given fallback value if the context does not exist.
   *
   * Must be called during component initialisation.
   */
  getOr(fallback) {
    const context = getContext(this.#key);
    if (context === void 0) {
      return fallback;
    }
    return context;
  }
  /**
   * Associates the given value with the current component and returns it.
   *
   * Must be called during component initialisation.
   */
  set(context) {
    return setContext(this.#key, context);
  }
}
function runWatcher(sources, flush, effect, options = {}) {
  const { lazy = false } = options;
}
function watch(sources, effect, options) {
  runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
  runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
function get$1(value) {
  if (isFunction(value)) {
    return value();
  }
  return value;
}
class ElementSize {
  // no need to use `$state` here since we are using createSubscriber
  #size = { width: 0, height: 0 };
  #observed = false;
  #options;
  #node;
  #window;
  // we use a derived here to extract the width so that if the width doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #width = derived(() => {
    this.#subscribe()?.();
    return this.getSize().width;
  });
  // we use a derived here to extract the height so that if the height doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #height = derived(() => {
    this.#subscribe()?.();
    return this.getSize().height;
  });
  // we need to use a derived here because the class will be created before the node is bound to the ref
  #subscribe = derived(() => {
    const node$ = get$1(this.#node);
    if (!node$) return;
    return createSubscriber();
  });
  constructor(node, options = { box: "border-box" }) {
    this.#window = options.window ?? defaultWindow;
    this.#options = options;
    this.#node = node;
    this.#size = { width: 0, height: 0 };
  }
  calculateSize() {
    const element2 = get$1(this.#node);
    if (!element2 || !this.#window) {
      return;
    }
    const offsetWidth = element2.offsetWidth;
    const offsetHeight = element2.offsetHeight;
    if (this.#options.box === "border-box") {
      return { width: offsetWidth, height: offsetHeight };
    }
    const style = this.#window.getComputedStyle(element2);
    const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const contentWidth = offsetWidth - paddingWidth - borderWidth;
    const contentHeight = offsetHeight - paddingHeight - borderHeight;
    return { width: contentWidth, height: contentHeight };
  }
  getSize() {
    return this.#observed ? this.#size : this.calculateSize() ?? this.#size;
  }
  get current() {
    this.#subscribe()?.();
    return this.getSize();
  }
  get width() {
    return this.#width();
  }
  get height() {
    return this.#height();
  }
}
function boolToStr(condition) {
  return condition ? "true" : "false";
}
function boolToEmptyStrOrUndef(condition) {
  return condition ? "" : void 0;
}
function getDataOpenClosed(condition) {
  return condition ? "open" : "closed";
}
class BitsAttrs {
  #variant;
  #prefix;
  attrs;
  constructor(config) {
    this.#variant = config.getVariant ? config.getVariant() : null;
    this.#prefix = this.#variant ? `data-${this.#variant}-` : `data-${config.component}-`;
    this.getAttr = this.getAttr.bind(this);
    this.selector = this.selector.bind(this);
    this.attrs = Object.fromEntries(config.parts.map((part) => [part, this.getAttr(part)]));
  }
  getAttr(part, variantOverride) {
    if (variantOverride)
      return `data-${variantOverride}-${part}`;
    return `${this.#prefix}${part}`;
  }
  selector(part, variantOverride) {
    return `[${this.getAttr(part, variantOverride)}]`;
  }
}
function createBitsAttrs(config) {
  const bitsAttrs = new BitsAttrs(config);
  return {
    ...bitsAttrs.attrs,
    selector: bitsAttrs.selector,
    getAttr: bitsAttrs.getAttr
  };
}
const ENTER = "Enter";
const ESCAPE = "Escape";
const SPACE = " ";
const isBrowser = typeof document !== "undefined";
const isIOS = getIsIOS();
function getIsIOS() {
  return isBrowser && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
  window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function isHTMLElement(element2) {
  return element2 instanceof HTMLElement;
}
function isElement(element2) {
  return element2 instanceof Element;
}
function isElementOrSVGElement(element2) {
  return element2 instanceof Element || element2 instanceof SVGElement;
}
function isFocusVisible(element2) {
  return element2.matches(":focus-visible");
}
function isNotNull(value) {
  return value !== null;
}
class AnimationsComplete {
  #opts;
  #currentFrame = null;
  constructor(opts) {
    this.#opts = opts;
  }
  #cleanup() {
    if (!this.#currentFrame)
      return;
    window.cancelAnimationFrame(this.#currentFrame);
    this.#currentFrame = null;
  }
  run(fn) {
    this.#cleanup();
    const node = this.#opts.ref.current;
    if (!node)
      return;
    if (typeof node.getAnimations !== "function") {
      this.#executeCallback(fn);
      return;
    }
    this.#currentFrame = window.requestAnimationFrame(() => {
      const animations = node.getAnimations();
      if (animations.length === 0) {
        this.#executeCallback(fn);
        return;
      }
      Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        this.#executeCallback(fn);
      });
    });
  }
  #executeCallback(fn) {
    const execute = () => {
      fn();
    };
    if (this.#opts.afterTick) {
      afterTick(execute);
    } else {
      execute();
    }
  }
}
class PresenceManager {
  #opts;
  #enabled;
  #afterAnimations;
  #shouldRender = false;
  constructor(opts) {
    this.#opts = opts;
    this.#shouldRender = opts.open.current;
    this.#enabled = opts.enabled ?? true;
    this.#afterAnimations = new AnimationsComplete({ ref: this.#opts.ref, afterTick: this.#opts.open });
    watch(() => this.#opts.open.current, (isOpen) => {
      if (isOpen) this.#shouldRender = true;
      if (!this.#enabled) return;
      this.#afterAnimations.run(() => {
        if (isOpen === this.#opts.open.current) {
          if (!this.#opts.open.current) {
            this.#shouldRender = false;
          }
          this.#opts.onComplete?.();
        }
      });
    });
  }
  get shouldRender() {
    return this.#shouldRender;
  }
}
function noop() {
}
function createId(prefixOrUid, uid) {
  return `bits-${prefixOrUid}`;
}
const BitsConfigContext = new Context("BitsConfig");
function getBitsConfig() {
  const fallback = new BitsConfigState(null, {});
  return BitsConfigContext.getOr(fallback).opts;
}
class BitsConfigState {
  opts;
  constructor(parent, opts) {
    const resolveConfigOption = createConfigResolver(parent, opts);
    this.opts = {
      defaultPortalTo: resolveConfigOption((config) => config.defaultPortalTo),
      defaultLocale: resolveConfigOption((config) => config.defaultLocale)
    };
  }
}
function createConfigResolver(parent, currentOpts) {
  return (getter) => {
    const configOption = boxWith(() => {
      const value = getter(currentOpts)?.current;
      if (value !== void 0)
        return value;
      if (parent === null)
        return void 0;
      return getter(parent.opts)?.current;
    });
    return configOption;
  };
}
function createPropResolver(configOption, fallback) {
  return (getProp) => {
    const config = getBitsConfig();
    return boxWith(() => {
      const propValue = getProp();
      if (propValue !== void 0)
        return propValue;
      const option = configOption(config).current;
      if (option !== void 0)
        return option;
      return fallback;
    });
  };
}
const resolvePortalToProp = createPropResolver((config) => config.defaultPortalTo, "body");
function Portal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { to: toProp, children, disabled } = $$props;
    const to = resolvePortalToProp(() => toProp);
    getAllContexts();
    let target = getTarget();
    function getTarget() {
      if (!isBrowser || disabled) return null;
      let localTarget = null;
      if (typeof to.current === "string") {
        const target2 = document.querySelector(to.current);
        localTarget = target2;
      } else {
        localTarget = to.current;
      }
      return localTarget;
    }
    let instance;
    function unmountInstance() {
      if (instance) {
        unmount();
        instance = null;
      }
    }
    watch([() => target, () => disabled], ([target2, disabled2]) => {
      if (!target2 || disabled2) {
        unmountInstance();
        return;
      }
      instance = mount();
      return () => {
        unmountInstance();
      };
    });
    if (disabled) {
      $$renderer2.push("<!--[-->");
      children?.($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function debounce(fn, wait = 500) {
  let timeout = null;
  const debounced = (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
  debounced.destroy = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
function isClickTrulyOutside(event, contentNode) {
  const { clientX, clientY } = event;
  const rect = contentNode.getBoundingClientRect();
  return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
const CONTEXT_MENU_TRIGGER_ATTR = "data-context-menu-trigger";
const CONTEXT_MENU_CONTENT_ATTR = "data-context-menu-content";
createBitsAttrs({
  component: "menu",
  parts: [
    "trigger",
    "content",
    "sub-trigger",
    "item",
    "group",
    "group-heading",
    "checkbox-group",
    "checkbox-item",
    "radio-group",
    "radio-item",
    "separator",
    "sub-content",
    "arrow"
  ]
});
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
class DismissibleLayerState {
  static create(opts) {
    return new DismissibleLayerState(opts);
  }
  opts;
  #interactOutsideProp;
  #behaviorType;
  #interceptedEvents = { pointerdown: false };
  #isResponsibleLayer = false;
  #isFocusInsideDOMTree = false;
  #documentObj = void 0;
  #onFocusOutside;
  #unsubClickListener = noop;
  constructor(opts) {
    this.opts = opts;
    this.#behaviorType = opts.interactOutsideBehavior;
    this.#interactOutsideProp = opts.onInteractOutside;
    this.#onFocusOutside = opts.onFocusOutside;
    let unsubEvents = noop;
    const cleanup = () => {
      this.#resetState();
      globalThis.bitsDismissableLayers.delete(this);
      this.#handleInteractOutside.destroy();
      unsubEvents();
    };
    watch([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
      if (!this.opts.enabled.current || !this.opts.ref.current) return;
      afterSleep(1, () => {
        if (!this.opts.ref.current) return;
        globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      });
      return cleanup;
    });
  }
  #handleFocus = (event) => {
    if (event.defaultPrevented) return;
    if (!this.opts.ref.current) return;
    afterTick(() => {
      if (!this.opts.ref.current || this.#isTargetWithinLayer(event.target)) return;
      if (event.target && !this.#isFocusInsideDOMTree) {
        this.#onFocusOutside.current?.(event);
      }
    });
  };
  #addEventListeners() {
    return executeCallbacks(
      /**
       * CAPTURE INTERACTION START
       * mark interaction-start event as intercepted.
       * mark responsible layer during interaction start
       * to avoid checking if is responsible layer during interaction end
       * when a new floating element may have been opened.
       */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }),
      /**
       * BUBBLE INTERACTION START
       * Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
       * to avoid prematurely checking if other events were intercepted.
       */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
      /**
       * HANDLE FOCUS OUTSIDE
       */
      on(this.#documentObj, "focusin", this.#handleFocus)
    );
  }
  #handleDismiss = (e) => {
    let event = e;
    if (event.defaultPrevented) {
      event = createWrappedEvent(e);
    }
    this.#interactOutsideProp.current(e);
  };
  #handleInteractOutside = debounce(
    (e) => {
      if (!this.opts.ref.current) {
        this.#unsubClickListener();
        return;
      }
      const isEventValid = this.opts.isValidEvent.current(e, this.opts.ref.current) || isValidEvent(e, this.opts.ref.current);
      if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
        this.#unsubClickListener();
        return;
      }
      let event = e;
      if (event.defaultPrevented) {
        event = createWrappedEvent(event);
      }
      if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
        this.#unsubClickListener();
        return;
      }
      if (e.pointerType === "touch") {
        this.#unsubClickListener();
        this.#unsubClickListener = on(this.#documentObj, "click", this.#handleDismiss, { once: true });
      } else {
        this.#interactOutsideProp.current(event);
      }
    },
    10
  );
  #markInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = true;
  };
  #markNonInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = false;
  };
  #markResponsibleLayer = () => {
    if (!this.opts.ref.current) return;
    this.#isResponsibleLayer = isResponsibleLayer(this.opts.ref.current);
  };
  #isTargetWithinLayer = (target) => {
    if (!this.opts.ref.current) return false;
    return isOrContainsTarget(this.opts.ref.current, target);
  };
  #resetState = debounce(
    () => {
      for (const eventType in this.#interceptedEvents) {
        this.#interceptedEvents[eventType] = false;
      }
      this.#isResponsibleLayer = false;
    },
    20
  );
  #isAnyEventIntercepted() {
    const i = Object.values(this.#interceptedEvents).some(Boolean);
    return i;
  }
  #onfocuscapture = () => {
    this.#isFocusInsideDOMTree = true;
  };
  #onblurcapture = () => {
    this.#isFocusInsideDOMTree = false;
  };
  props = {
    onfocuscapture: this.#onfocuscapture,
    onblurcapture: this.#onblurcapture
  };
}
function getTopMostDismissableLayer(layersArr = [...globalThis.bitsDismissableLayers]) {
  return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
  const layersArr = [...globalThis.bitsDismissableLayers];
  const topMostLayer = getTopMostDismissableLayer(layersArr);
  if (topMostLayer) return topMostLayer[0].opts.ref.current === node;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode.opts.ref.current === node;
}
function isValidEvent(e, node) {
  const target = e.target;
  if (!isElementOrSVGElement(target)) return false;
  const targetIsContextMenuTrigger = Boolean(target.closest(`[${CONTEXT_MENU_TRIGGER_ATTR}]`));
  if ("button" in e && e.button > 0 && !targetIsContextMenuTrigger) return false;
  if ("button" in e && e.button === 0 && targetIsContextMenuTrigger) return true;
  const nodeIsContextMenu = Boolean(node.closest(`[${CONTEXT_MENU_CONTENT_ATTR}]`));
  if (targetIsContextMenuTrigger && nodeIsContextMenu) return false;
  const ownerDocument = getOwnerDocument(target);
  const isValid = ownerDocument.documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
  return isValid;
}
function createWrappedEvent(e) {
  const capturedCurrentTarget = e.currentTarget;
  const capturedTarget = e.target;
  let newEvent;
  if (e instanceof PointerEvent) {
    newEvent = new PointerEvent(e.type, e);
  } else {
    newEvent = new PointerEvent("pointerdown", e);
  }
  let isPrevented = false;
  const wrappedEvent = new Proxy(newEvent, {
    get: (target, prop) => {
      if (prop === "currentTarget") {
        return capturedCurrentTarget;
      }
      if (prop === "target") {
        return capturedTarget;
      }
      if (prop === "preventDefault") {
        return () => {
          isPrevented = true;
          if (typeof target.preventDefault === "function") {
            target.preventDefault();
          }
        };
      }
      if (prop === "defaultPrevented") {
        return isPrevented;
      }
      if (prop in target) {
        return target[prop];
      }
      return e[prop];
    }
  });
  return wrappedEvent;
}
function Dismissible_layer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      interactOutsideBehavior = "close",
      onInteractOutside = noop,
      onFocusOutside = noop,
      id,
      children,
      enabled,
      isValidEvent: isValidEvent2 = () => false,
      ref
    } = $$props;
    const dismissibleLayerState = DismissibleLayerState.create({
      id: boxWith(() => id),
      interactOutsideBehavior: boxWith(() => interactOutsideBehavior),
      onInteractOutside: boxWith(() => onInteractOutside),
      enabled: boxWith(() => enabled),
      onFocusOutside: boxWith(() => onFocusOutside),
      isValidEvent: boxWith(() => isValidEvent2),
      ref
    });
    children?.($$renderer2, { props: dismissibleLayerState.props });
    $$renderer2.push(`<!---->`);
  });
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
class EscapeLayerState {
  static create(opts) {
    return new EscapeLayerState(opts);
  }
  opts;
  domContext;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(this.opts.ref);
    let unsubEvents = noop;
    watch(() => opts.enabled.current, (enabled) => {
      if (enabled) {
        globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
        unsubEvents = this.#addEventListener();
      }
      return () => {
        unsubEvents();
        globalThis.bitsEscapeLayers.delete(this);
      };
    });
  }
  #addEventListener = () => {
    return on(this.domContext.getDocument(), "keydown", this.#onkeydown, { passive: false });
  };
  #onkeydown = (e) => {
    if (e.key !== ESCAPE || !isResponsibleEscapeLayer(this)) return;
    const clonedEvent = new KeyboardEvent(e.type, e);
    e.preventDefault();
    const behaviorType = this.opts.escapeKeydownBehavior.current;
    if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
    this.opts.onEscapeKeydown.current(clonedEvent);
  };
}
function isResponsibleEscapeLayer(instance) {
  const layersArr = [...globalThis.bitsEscapeLayers];
  const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
  if (topMostLayer) return topMostLayer[0] === instance;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode === instance;
}
function Escape_layer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      escapeKeydownBehavior = "close",
      onEscapeKeydown = noop,
      children,
      enabled,
      ref
    } = $$props;
    EscapeLayerState.create({
      escapeKeydownBehavior: boxWith(() => escapeKeydownBehavior),
      onEscapeKeydown: boxWith(() => onEscapeKeydown),
      enabled: boxWith(() => enabled),
      ref
    });
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
class FocusScopeManager {
  static instance;
  #scopeStack = simpleBox([]);
  #focusHistory = /* @__PURE__ */ new WeakMap();
  #preFocusHistory = /* @__PURE__ */ new WeakMap();
  static getInstance() {
    if (!this.instance) {
      this.instance = new FocusScopeManager();
    }
    return this.instance;
  }
  register(scope) {
    const current = this.getActive();
    if (current && current !== scope) {
      current.pause();
    }
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      this.#preFocusHistory.set(scope, activeElement);
    }
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    this.#scopeStack.current.unshift(scope);
  }
  unregister(scope) {
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    const next = this.getActive();
    if (next) {
      next.resume();
    }
  }
  getActive() {
    return this.#scopeStack.current[0];
  }
  setFocusMemory(scope, element2) {
    this.#focusHistory.set(scope, element2);
  }
  getFocusMemory(scope) {
    return this.#focusHistory.get(scope);
  }
  isActiveScope(scope) {
    return this.getActive() === scope;
  }
  setPreFocusMemory(scope, element2) {
    this.#preFocusHistory.set(scope, element2);
  }
  getPreFocusMemory(scope) {
    return this.#preFocusHistory.get(scope);
  }
  clearPreFocusMemory(scope) {
    this.#preFocusHistory.delete(scope);
  }
}
class FocusScope {
  #paused = false;
  #container = null;
  #manager = FocusScopeManager.getInstance();
  #cleanupFns = [];
  #opts;
  constructor(opts) {
    this.#opts = opts;
  }
  get paused() {
    return this.#paused;
  }
  pause() {
    this.#paused = true;
  }
  resume() {
    this.#paused = false;
  }
  #cleanup() {
    for (const fn of this.#cleanupFns) {
      fn();
    }
    this.#cleanupFns = [];
  }
  mount(container) {
    if (this.#container) {
      this.unmount();
    }
    this.#container = container;
    this.#manager.register(this);
    this.#setupEventListeners();
    this.#handleOpenAutoFocus();
  }
  unmount() {
    if (!this.#container) return;
    this.#cleanup();
    this.#handleCloseAutoFocus();
    this.#manager.unregister(this);
    this.#manager.clearPreFocusMemory(this);
    this.#container = null;
  }
  #handleOpenAutoFocus() {
    if (!this.#container) return;
    const event = new CustomEvent("focusScope.onOpenAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onOpenAutoFocus.current(event);
    if (!event.defaultPrevented) {
      requestAnimationFrame(() => {
        if (!this.#container) return;
        const firstTabbable = this.#getFirstTabbable();
        if (firstTabbable) {
          firstTabbable.focus();
          this.#manager.setFocusMemory(this, firstTabbable);
        } else {
          this.#container.focus();
        }
      });
    }
  }
  #handleCloseAutoFocus() {
    const event = new CustomEvent("focusScope.onCloseAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onCloseAutoFocus.current?.(event);
    if (!event.defaultPrevented) {
      const preFocusedElement = this.#manager.getPreFocusMemory(this);
      if (preFocusedElement && document.contains(preFocusedElement)) {
        try {
          preFocusedElement.focus();
        } catch {
          document.body.focus();
        }
      }
    }
  }
  #setupEventListeners() {
    if (!this.#container || !this.#opts.trap.current) return;
    const container = this.#container;
    const doc = container.ownerDocument;
    const handleFocus = (e) => {
      if (this.#paused || !this.#manager.isActiveScope(this)) return;
      const target = e.target;
      if (!target) return;
      const isInside = container.contains(target);
      if (isInside) {
        this.#manager.setFocusMemory(this, target);
      } else {
        const lastFocused = this.#manager.getFocusMemory(this);
        if (lastFocused && container.contains(lastFocused) && isFocusable(lastFocused)) {
          e.preventDefault();
          lastFocused.focus();
        } else {
          const firstTabbable = this.#getFirstTabbable();
          const firstFocusable = this.#getAllFocusables()[0];
          (firstTabbable || firstFocusable || container).focus();
        }
      }
    };
    const handleKeydown = (e) => {
      if (!this.#opts.loop || this.#paused || e.key !== "Tab") return;
      if (!this.#manager.isActiveScope(this)) return;
      const tabbables = this.#getTabbables();
      if (tabbables.length < 2) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    this.#cleanupFns.push(on(doc, "focusin", handleFocus, { capture: true }), on(container, "keydown", handleKeydown));
    const observer = new MutationObserver(() => {
      const lastFocused = this.#manager.getFocusMemory(this);
      if (lastFocused && !container.contains(lastFocused)) {
        const firstTabbable = this.#getFirstTabbable();
        const firstFocusable = this.#getAllFocusables()[0];
        const elementToFocus = firstTabbable || firstFocusable;
        if (elementToFocus) {
          elementToFocus.focus();
          this.#manager.setFocusMemory(this, elementToFocus);
        } else {
          container.focus();
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    this.#cleanupFns.push(() => observer.disconnect());
  }
  #getTabbables() {
    if (!this.#container) return [];
    return tabbable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  #getFirstTabbable() {
    const tabbables = this.#getTabbables();
    return tabbables[0] || null;
  }
  #getAllFocusables() {
    if (!this.#container) return [];
    return focusable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  static use(opts) {
    let scope = null;
    watch([() => opts.ref.current, () => opts.enabled.current], ([ref, enabled]) => {
      if (ref && enabled) {
        if (!scope) {
          scope = new FocusScope(opts);
        }
        scope.mount(ref);
      } else if (scope) {
        scope.unmount();
        scope = null;
      }
    });
    return {
      get props() {
        return { tabindex: -1 };
      }
    };
  }
}
function Focus_scope($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      enabled = false,
      trapFocus = false,
      loop = false,
      onCloseAutoFocus = noop,
      onOpenAutoFocus = noop,
      focusScope,
      ref
    } = $$props;
    const focusScopeState = FocusScope.use({
      enabled: boxWith(() => enabled),
      trap: boxWith(() => trapFocus),
      loop,
      onCloseAutoFocus: boxWith(() => onCloseAutoFocus),
      onOpenAutoFocus: boxWith(() => onOpenAutoFocus),
      ref
    });
    focusScope?.($$renderer2, { props: focusScopeState.props });
    $$renderer2.push(`<!---->`);
  });
}
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
class TextSelectionLayerState {
  static create(opts) {
    return new TextSelectionLayerState(opts);
  }
  opts;
  domContext;
  #unsubSelectionLock = noop;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(opts.ref);
    let unsubEvents = noop;
    watch(() => this.opts.enabled.current, (isEnabled2) => {
      if (isEnabled2) {
        globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      }
      return () => {
        unsubEvents();
        this.#resetSelectionLock();
        globalThis.bitsTextSelectionLayers.delete(this);
      };
    });
  }
  #addEventListeners() {
    return executeCallbacks(on(this.domContext.getDocument(), "pointerdown", this.#pointerdown), on(this.domContext.getDocument(), "pointerup", composeHandlers(this.#resetSelectionLock, this.opts.onPointerUp.current)));
  }
  #pointerdown = (e) => {
    const node = this.opts.ref.current;
    const target = e.target;
    if (!isHTMLElement(node) || !isHTMLElement(target) || !this.opts.enabled.current) return;
    if (!isHighestLayer(this) || !contains(node, target)) return;
    this.opts.onPointerDown.current(e);
    if (e.defaultPrevented) return;
    this.#unsubSelectionLock = preventTextSelectionOverflow(node, this.domContext.getDocument().body);
  };
  #resetSelectionLock = () => {
    this.#unsubSelectionLock();
    this.#unsubSelectionLock = noop;
  };
}
const getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node, body) {
  const originalBodyUserSelect = getUserSelect(body);
  const originalNodeUserSelect = getUserSelect(node);
  setUserSelect(body, "none");
  setUserSelect(node, "text");
  return () => {
    setUserSelect(body, originalBodyUserSelect);
    setUserSelect(node, originalNodeUserSelect);
  };
}
function setUserSelect(node, value) {
  node.style.userSelect = value;
  node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
  const layersArr = [...globalThis.bitsTextSelectionLayers];
  if (!layersArr.length) return false;
  const highestLayer = layersArr.at(-1);
  if (!highestLayer) return false;
  return highestLayer[0] === instance;
}
function Text_selection_layer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      preventOverflowTextSelection = true,
      onPointerDown = noop,
      onPointerUp = noop,
      id,
      children,
      enabled,
      ref
    } = $$props;
    TextSelectionLayerState.create({
      id: boxWith(() => id),
      onPointerDown: boxWith(() => onPointerDown),
      onPointerUp: boxWith(() => onPointerUp),
      enabled: boxWith(() => enabled && preventOverflowTextSelection),
      ref
    });
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
globalThis.bitsIdCounter ??= { current: 0 };
function useId(prefix = "bits") {
  globalThis.bitsIdCounter.current++;
  return `${prefix}-${globalThis.bitsIdCounter.current}`;
}
class SharedState {
  #factory;
  #subscribers = 0;
  #state;
  #scope;
  constructor(factory) {
    this.#factory = factory;
  }
  #dispose() {
    this.#subscribers -= 1;
    if (this.#scope && this.#subscribers <= 0) {
      this.#scope();
      this.#state = void 0;
      this.#scope = void 0;
    }
  }
  get(...args) {
    this.#subscribers += 1;
    if (this.#state === void 0) {
      this.#scope = () => {
      };
    }
    return this.#state;
  }
}
const lockMap = new SvelteMap();
let initialBodyStyle = null;
let cleanupTimeoutId = null;
let isInCleanupTransition = false;
const anyLocked = boxWith(() => {
  for (const value of lockMap.values()) {
    if (value) return true;
  }
  return false;
});
let cleanupScheduledAt = null;
const bodyLockStackCount = new SharedState(() => {
  function resetBodyStyle() {
    return;
  }
  function cancelPendingCleanup() {
    if (cleanupTimeoutId === null) return;
    window.clearTimeout(cleanupTimeoutId);
    cleanupTimeoutId = null;
  }
  function scheduleCleanupIfNoNewLocks(delay, callback) {
    cancelPendingCleanup();
    isInCleanupTransition = true;
    cleanupScheduledAt = Date.now();
    const currentCleanupId = cleanupScheduledAt;
    const cleanupFn = () => {
      cleanupTimeoutId = null;
      if (cleanupScheduledAt !== currentCleanupId) return;
      if (!isAnyLocked(lockMap)) {
        isInCleanupTransition = false;
        callback();
      } else {
        isInCleanupTransition = false;
      }
    };
    const actualDelay = delay === null ? 24 : delay;
    cleanupTimeoutId = window.setTimeout(cleanupFn, actualDelay);
  }
  function ensureInitialStyleCaptured() {
    if (initialBodyStyle === null && lockMap.size === 0 && !isInCleanupTransition) {
      initialBodyStyle = document.body.getAttribute("style");
    }
  }
  watch(() => anyLocked.current, () => {
    if (!anyLocked.current) return;
    ensureInitialStyleCaptured();
    isInCleanupTransition = false;
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const hasStableGutter = htmlStyle.scrollbarGutter?.includes("stable") || bodyStyle.scrollbarGutter?.includes("stable");
    const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const paddingRight = Number.parseInt(bodyStyle.paddingRight ?? "0", 10);
    const config = {
      padding: paddingRight + verticalScrollbarWidth,
      margin: Number.parseInt(bodyStyle.marginRight ?? "0", 10)
    };
    if (verticalScrollbarWidth > 0 && !hasStableGutter) {
      document.body.style.paddingRight = `${config.padding}px`;
      document.body.style.marginRight = `${config.margin}px`;
      document.body.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
    }
    document.body.style.overflow = "hidden";
    if (isIOS) {
      on(
        document,
        "touchmove",
        (e) => {
          if (e.target !== document.documentElement) return;
          if (e.touches.length > 1) return;
          e.preventDefault();
        },
        { passive: false }
      );
    }
    afterTick(() => {
      document.body.style.pointerEvents = "none";
      document.body.style.overflow = "hidden";
    });
  });
  return {
    get lockMap() {
      return lockMap;
    },
    resetBodyStyle,
    scheduleCleanupIfNoNewLocks,
    cancelPendingCleanup,
    ensureInitialStyleCaptured
  };
});
class BodyScrollLock {
  #id = useId();
  #initialState;
  #restoreScrollDelay = () => null;
  #countState;
  locked;
  constructor(initialState, restoreScrollDelay = () => null) {
    this.#initialState = initialState;
    this.#restoreScrollDelay = restoreScrollDelay;
    this.#countState = bodyLockStackCount.get();
    if (!this.#countState) return;
    this.#countState.cancelPendingCleanup();
    this.#countState.ensureInitialStyleCaptured();
    this.#countState.lockMap.set(this.#id, this.#initialState ?? false);
    this.locked = boxWith(() => this.#countState.lockMap.get(this.#id) ?? false, (v) => this.#countState.lockMap.set(this.#id, v));
  }
}
function isAnyLocked(map) {
  for (const [_, value] of map) {
    if (value) return true;
  }
  return false;
}
function Scroll_lock($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { preventScroll = true, restoreScrollDelay = null } = $$props;
    if (preventScroll) {
      new BodyScrollLock(preventScroll, () => restoreScrollDelay);
    }
  });
}
const collapsibleAttrs = createBitsAttrs({
  component: "collapsible",
  parts: ["root", "content", "trigger"]
});
const CollapsibleRootContext = new Context("Collapsible.Root");
class CollapsibleRootState {
  static create(opts) {
    return CollapsibleRootContext.set(new CollapsibleRootState(opts));
  }
  opts;
  attachment;
  contentNode = null;
  contentPresence;
  contentId = void 0;
  constructor(opts) {
    this.opts = opts;
    this.toggleOpen = this.toggleOpen.bind(this);
    this.attachment = attachRef(this.opts.ref);
    this.contentPresence = new PresenceManager({
      ref: boxWith(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": getDataOpenClosed(this.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
    [collapsibleAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleContentState {
  static create(opts) {
    return new CollapsibleContentState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #present = derived(() => {
    if (this.opts.hiddenUntilFound.current) return this.root.opts.open.current;
    return this.opts.forceMount.current || this.root.opts.open.current;
  });
  get present() {
    return this.#present();
  }
  set present($$value) {
    return this.#present($$value);
  }
  #originalStyles;
  #isMountAnimationPrevented = false;
  #width = 0;
  #height = 0;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.#isMountAnimationPrevented = root.opts.open.current;
    this.root.contentId = this.opts.id.current;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    watch.pre(() => this.opts.id.current, (id) => {
      this.root.contentId = id;
    });
    watch.pre(
      [
        () => this.opts.ref.current,
        () => this.opts.hiddenUntilFound.current
      ],
      ([node, hiddenUntilFound]) => {
        if (!node || !hiddenUntilFound) return;
        const handleBeforeMatch = () => {
          if (this.root.opts.open.current) return;
          requestAnimationFrame(() => {
            this.root.opts.open.current = true;
          });
        };
        return on(node, "beforematch", handleBeforeMatch);
      }
    );
    watch([() => this.opts.ref.current, () => this.present], ([node]) => {
      if (!node) return;
      afterTick(() => {
        if (!this.opts.ref.current) return;
        this.#originalStyles = this.#originalStyles || {
          transitionDuration: node.style.transitionDuration,
          animationName: node.style.animationName
        };
        node.style.transitionDuration = "0s";
        node.style.animationName = "none";
        const rect = node.getBoundingClientRect();
        this.#height = rect.height;
        this.#width = rect.width;
        if (!this.#isMountAnimationPrevented) {
          const { animationName, transitionDuration } = this.#originalStyles;
          node.style.transitionDuration = transitionDuration;
          node.style.animationName = animationName;
        }
      });
    });
  }
  get shouldRender() {
    return this.root.contentPresence.shouldRender;
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: {
      "--bits-collapsible-content-height": this.#height ? `${this.#height}px` : void 0,
      "--bits-collapsible-content-width": this.#width ? `${this.#width}px` : void 0
    },
    hidden: this.opts.hiddenUntilFound.current && !this.root.opts.open.current ? "until-found" : void 0,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.root.opts.disabled.current),
    [collapsibleAttrs.content]: "",
    ...this.opts.hiddenUntilFound.current && !this.shouldRender ? {} : {
      hidden: this.opts.hiddenUntilFound.current ? !this.shouldRender : this.opts.forceMount.current ? void 0 : !this.shouldRender
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class CollapsibleTriggerState {
  static create(opts) {
    return new CollapsibleTriggerState(opts, CollapsibleRootContext.get());
  }
  opts;
  root;
  attachment;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
  }
  onclick(e) {
    if (this.#isDisabled()) return;
    if (e.button !== 0) return e.preventDefault();
    this.root.toggleOpen();
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE || e.key === ENTER) {
      e.preventDefault();
      this.root.toggleOpen();
    }
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    type: "button",
    disabled: this.#isDisabled(),
    "aria-controls": this.root.contentId,
    "aria-expanded": boolToStr(this.root.opts.open.current),
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
    [collapsibleAttrs.trigger]: "",
    //
    onclick: this.onclick,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Collapsible$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      ref = null,
      open = false,
      disabled = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const rootState = CollapsibleRootState.create({
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      disabled: boxWith(() => disabled),
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    const mergedProps = mergeProps(restProps, rootState.props);
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref, open });
  });
}
function Collapsible_content$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      child,
      ref = null,
      forceMount = false,
      hiddenUntilFound = false,
      children,
      id = createId(uid),
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const contentState = CollapsibleContentState.create({
      id: boxWith(() => id),
      forceMount: boxWith(() => forceMount),
      hiddenUntilFound: boxWith(() => hiddenUntilFound),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = mergeProps(restProps, contentState.props);
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { ...contentState.snippetProps, props: mergedProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...mergedProps })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Collapsible_trigger$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      ref = null,
      id = createId(uid),
      disabled = false,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const triggerState = CollapsibleTriggerState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      disabled: boxWith(() => disabled)
    });
    const mergedProps = mergeProps(restProps, triggerState.props);
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button${attributes({ ...mergedProps })}>`);
      children?.($$renderer2);
      $$renderer2.push(`<!----></button>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function get(valueOrGetValue) {
  return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element2) {
  if (typeof window === "undefined") return 1;
  const win = element2.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element2, value) {
  const dpr = getDPR(element2);
  return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
  return {
    [`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
    [`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
    [`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
    [`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
    [`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
  };
}
function useFloating(options) {
  const openOption = get(options.open) ?? true;
  const middlewareOption = get(options.middleware);
  const transformOption = get(options.transform) ?? true;
  const placementOption = get(options.placement) ?? "bottom";
  const strategyOption = get(options.strategy) ?? "absolute";
  const sideOffsetOption = get(options.sideOffset) ?? 0;
  const alignOffsetOption = get(options.alignOffset) ?? 0;
  const reference = options.reference;
  let x = 0;
  let y = 0;
  const floating = simpleBox(null);
  let strategy = strategyOption;
  let placement = placementOption;
  let middlewareData = {};
  let isPositioned = false;
  const floatingStyles = (() => {
    const xVal = floating.current ? roundByDPR(floating.current, x) : x;
    const yVal = floating.current ? roundByDPR(floating.current, y) : y;
    if (transformOption) {
      return {
        position: strategy,
        left: "0",
        top: "0",
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...floating.current && getDPR(floating.current) >= 1.5 && { willChange: "transform" }
      };
    }
    return { position: strategy, left: `${xVal}px`, top: `${yVal}px` };
  })();
  function update() {
    if (reference.current === null || floating.current === null) return;
    computePosition(reference.current, floating.current, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    }).then((position) => {
      if (!openOption && x !== 0 && y !== 0) {
        const maxExpectedOffset = Math.max(Math.abs(sideOffsetOption), Math.abs(alignOffsetOption), 15);
        if (position.x <= maxExpectedOffset && position.y <= maxExpectedOffset) return;
      }
      x = position.x;
      y = position.y;
      strategy = position.strategy;
      placement = position.placement;
      middlewareData = position.middlewareData;
      isPositioned = true;
    });
  }
  return {
    floating,
    reference,
    get strategy() {
      return strategy;
    },
    get placement() {
      return placement;
    },
    get middlewareData() {
      return middlewareData;
    },
    get isPositioned() {
      return isPositioned;
    },
    get floatingStyles() {
      return floatingStyles;
    },
    get update() {
      return update;
    }
  };
}
const OPPOSITE_SIDE = { top: "bottom", right: "left", bottom: "top", left: "right" };
const FloatingRootContext = new Context("Floating.Root");
const FloatingContentContext = new Context("Floating.Content");
const FloatingTooltipRootContext = new Context("Floating.Root");
class FloatingRootState {
  static create(tooltip = false) {
    return tooltip ? FloatingTooltipRootContext.set(new FloatingRootState()) : FloatingRootContext.set(new FloatingRootState());
  }
  anchorNode = simpleBox(null);
  customAnchorNode = simpleBox(null);
  triggerNode = simpleBox(null);
  constructor() {
  }
}
class FloatingContentState {
  static create(opts, tooltip = false) {
    return tooltip ? FloatingContentContext.set(new FloatingContentState(opts, FloatingTooltipRootContext.get())) : FloatingContentContext.set(new FloatingContentState(opts, FloatingRootContext.get()));
  }
  opts;
  root;
  // nodes
  contentRef = simpleBox(null);
  wrapperRef = simpleBox(null);
  arrowRef = simpleBox(null);
  contentAttachment = attachRef(this.contentRef);
  wrapperAttachment = attachRef(this.wrapperRef);
  arrowAttachment = attachRef(this.arrowRef);
  // ids
  arrowId = simpleBox(useId());
  #transformedStyle = derived(() => {
    if (typeof this.opts.style === "string") return cssToStyleObj(this.opts.style);
    if (!this.opts.style) return {};
  });
  #updatePositionStrategy = void 0;
  #arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
  #arrowWidth = derived(() => this.#arrowSize?.width ?? 0);
  #arrowHeight = derived(() => this.#arrowSize?.height ?? 0);
  #desiredPlacement = derived(() => this.opts.side?.current + (this.opts.align.current !== "center" ? `-${this.opts.align.current}` : ""));
  #boundary = derived(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
  #hasExplicitBoundaries = derived(() => this.#boundary().length > 0);
  get hasExplicitBoundaries() {
    return this.#hasExplicitBoundaries();
  }
  set hasExplicitBoundaries($$value) {
    return this.#hasExplicitBoundaries($$value);
  }
  #detectOverflowOptions = derived(() => ({
    padding: this.opts.collisionPadding.current,
    boundary: this.#boundary().filter(isNotNull),
    altBoundary: this.hasExplicitBoundaries
  }));
  get detectOverflowOptions() {
    return this.#detectOverflowOptions();
  }
  set detectOverflowOptions($$value) {
    return this.#detectOverflowOptions($$value);
  }
  #availableWidth = void 0;
  #availableHeight = void 0;
  #anchorWidth = void 0;
  #anchorHeight = void 0;
  #middleware = derived(() => [
    offset({
      mainAxis: this.opts.sideOffset.current + this.#arrowHeight(),
      alignmentAxis: this.opts.alignOffset.current
    }),
    this.opts.avoidCollisions.current && shift({
      mainAxis: true,
      crossAxis: false,
      limiter: this.opts.sticky.current === "partial" ? limitShift() : void 0,
      ...this.detectOverflowOptions
    }),
    this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
    size({
      ...this.detectOverflowOptions,
      apply: ({ rects, availableWidth, availableHeight }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference;
        this.#availableWidth = availableWidth;
        this.#availableHeight = availableHeight;
        this.#anchorWidth = anchorWidth;
        this.#anchorHeight = anchorHeight;
      }
    }),
    this.arrowRef.current && arrow({
      element: this.arrowRef.current,
      padding: this.opts.arrowPadding.current
    }),
    transformOrigin({
      arrowWidth: this.#arrowWidth(),
      arrowHeight: this.#arrowHeight()
    }),
    this.opts.hideWhenDetached.current && hide({ strategy: "referenceHidden", ...this.detectOverflowOptions })
  ].filter(Boolean));
  get middleware() {
    return this.#middleware();
  }
  set middleware($$value) {
    return this.#middleware($$value);
  }
  floating;
  #placedSide = derived(() => getSideFromPlacement(this.floating.placement));
  get placedSide() {
    return this.#placedSide();
  }
  set placedSide($$value) {
    return this.#placedSide($$value);
  }
  #placedAlign = derived(() => getAlignFromPlacement(this.floating.placement));
  get placedAlign() {
    return this.#placedAlign();
  }
  set placedAlign($$value) {
    return this.#placedAlign($$value);
  }
  #arrowX = derived(() => this.floating.middlewareData.arrow?.x ?? 0);
  get arrowX() {
    return this.#arrowX();
  }
  set arrowX($$value) {
    return this.#arrowX($$value);
  }
  #arrowY = derived(() => this.floating.middlewareData.arrow?.y ?? 0);
  get arrowY() {
    return this.#arrowY();
  }
  set arrowY($$value) {
    return this.#arrowY($$value);
  }
  #cannotCenterArrow = derived(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
  get cannotCenterArrow() {
    return this.#cannotCenterArrow();
  }
  set cannotCenterArrow($$value) {
    return this.#cannotCenterArrow($$value);
  }
  contentZIndex;
  #arrowBaseSide = derived(() => OPPOSITE_SIDE[this.placedSide]);
  get arrowBaseSide() {
    return this.#arrowBaseSide();
  }
  set arrowBaseSide($$value) {
    return this.#arrowBaseSide($$value);
  }
  #wrapperProps = derived(() => ({
    id: this.opts.wrapperId.current,
    "data-bits-floating-content-wrapper": "",
    style: {
      ...this.floating.floatingStyles,
      transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
      minWidth: "max-content",
      zIndex: this.contentZIndex,
      "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
      "--bits-floating-available-width": `${this.#availableWidth}px`,
      "--bits-floating-available-height": `${this.#availableHeight}px`,
      "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
      "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
      ...this.floating.middlewareData.hide?.referenceHidden && { visibility: "hidden", "pointer-events": "none" },
      ...this.#transformedStyle()
    },
    dir: this.opts.dir.current,
    ...this.wrapperAttachment
  }));
  get wrapperProps() {
    return this.#wrapperProps();
  }
  set wrapperProps($$value) {
    return this.#wrapperProps($$value);
  }
  #props = derived(() => ({
    "data-side": this.placedSide,
    "data-align": this.placedAlign,
    style: styleToString({ ...this.#transformedStyle() }),
    ...this.contentAttachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  #arrowStyle = derived(() => ({
    position: "absolute",
    left: this.arrowX ? `${this.arrowX}px` : void 0,
    top: this.arrowY ? `${this.arrowY}px` : void 0,
    [this.arrowBaseSide]: 0,
    "transform-origin": { top: "", right: "0 0", bottom: "center 0", left: "100% 0" }[this.placedSide],
    transform: {
      top: "translateY(100%)",
      right: "translateY(50%) rotate(90deg) translateX(-50%)",
      bottom: "rotate(180deg)",
      left: "translateY(50%) rotate(-90deg) translateX(50%)"
    }[this.placedSide],
    visibility: this.cannotCenterArrow ? "hidden" : void 0
  }));
  get arrowStyle() {
    return this.#arrowStyle();
  }
  set arrowStyle($$value) {
    return this.#arrowStyle($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.customAnchor) {
      this.root.customAnchorNode.current = opts.customAnchor.current;
    }
    watch(() => opts.customAnchor.current, (customAnchor) => {
      this.root.customAnchorNode.current = customAnchor;
    });
    this.floating = useFloating({
      strategy: () => this.opts.strategy.current,
      placement: () => this.#desiredPlacement(),
      middleware: () => this.middleware,
      reference: this.root.anchorNode,
      open: () => this.opts.enabled.current,
      sideOffset: () => this.opts.sideOffset.current,
      alignOffset: () => this.opts.alignOffset.current
    });
    watch(() => this.contentRef.current, (contentNode) => {
      if (!contentNode) return;
      const win = getWindow(contentNode);
      this.contentZIndex = win.getComputedStyle(contentNode).zIndex;
    });
  }
}
class FloatingArrowState {
  static create(opts) {
    return new FloatingArrowState(opts, FloatingContentContext.get());
  }
  opts;
  content;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    style: this.content.arrowStyle,
    "data-side": this.content.placedSide,
    ...this.content.arrowAttachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class FloatingAnchorState {
  static create(opts, tooltip = false) {
    return tooltip ? new FloatingAnchorState(opts, FloatingTooltipRootContext.get()) : new FloatingAnchorState(opts, FloatingRootContext.get());
  }
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.virtualEl && opts.virtualEl.current) {
      root.triggerNode = boxFrom(opts.virtualEl.current);
    } else {
      root.triggerNode = opts.ref;
    }
  }
}
function transformOrigin(options) {
  return {
    name: "transformOrigin",
    options,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function getSideFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, tooltip = false } = $$props;
    FloatingRootState.create(tooltip);
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
function Floating_layer_anchor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id, children, virtualEl, ref, tooltip = false } = $$props;
    FloatingAnchorState.create(
      {
        id: boxWith(() => id),
        virtualEl: boxWith(() => virtualEl),
        ref
      },
      tooltip
    );
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
function Arrow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      id = useId(),
      children,
      child,
      width = 10,
      height = 5,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const mergedProps = mergeProps(restProps, { id });
    if (child) {
      $$renderer2.push("<!--[-->");
      child($$renderer2, { props: mergedProps });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span${attributes({ ...mergedProps })}>`);
      if (children) {
        $$renderer2.push("<!--[-->");
        children?.($$renderer2);
        $$renderer2.push(`<!---->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<svg${attr("width", width)}${attr("height", height)} viewBox="0 0 30 10" preserveAspectRatio="none" data-arrow=""><polygon points="0,0 30,0 15,10" fill="currentColor"></polygon></svg>`);
      }
      $$renderer2.push(`<!--]--></span>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Floating_layer_arrow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id = useId(), ref = null, $$slots, $$events, ...restProps } = $$props;
    const arrowState = FloatingArrowState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = mergeProps(restProps, arrowState.props);
    Arrow($$renderer2, spread_props([mergedProps]));
    bind_props($$props, { ref });
  });
}
function Floating_layer_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      content,
      side = "bottom",
      sideOffset = 0,
      align = "center",
      alignOffset = 0,
      id,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary = [],
      collisionPadding = 0,
      hideWhenDetached = false,
      onPlaced = () => {
      },
      sticky = "partial",
      updatePositionStrategy = "optimized",
      strategy = "fixed",
      dir = "ltr",
      style = {},
      wrapperId = useId(),
      customAnchor = null,
      enabled,
      tooltip = false
    } = $$props;
    const contentState = FloatingContentState.create(
      {
        side: boxWith(() => side),
        sideOffset: boxWith(() => sideOffset),
        align: boxWith(() => align),
        alignOffset: boxWith(() => alignOffset),
        id: boxWith(() => id),
        arrowPadding: boxWith(() => arrowPadding),
        avoidCollisions: boxWith(() => avoidCollisions),
        collisionBoundary: boxWith(() => collisionBoundary),
        collisionPadding: boxWith(() => collisionPadding),
        hideWhenDetached: boxWith(() => hideWhenDetached),
        onPlaced: boxWith(() => onPlaced),
        sticky: boxWith(() => sticky),
        updatePositionStrategy: boxWith(() => updatePositionStrategy),
        strategy: boxWith(() => strategy),
        dir: boxWith(() => dir),
        style: boxWith(() => style),
        enabled: boxWith(() => enabled),
        wrapperId: boxWith(() => wrapperId),
        customAnchor: boxWith(() => customAnchor)
      },
      tooltip
    );
    const mergedProps = mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } });
    content?.($$renderer2, { props: contentState.props, wrapperProps: mergedProps });
    $$renderer2.push(`<!---->`);
  });
}
function Floating_layer_content_static($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { content } = $$props;
    content?.($$renderer2, { props: {}, wrapperProps: {} });
    $$renderer2.push(`<!---->`);
  });
}
function Popper_content($$renderer, $$props) {
  let {
    content,
    isStatic = false,
    onPlaced,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (isStatic) {
    $$renderer.push("<!--[-->");
    Floating_layer_content_static($$renderer, { content });
  } else {
    $$renderer.push("<!--[!-->");
    Floating_layer_content($$renderer, spread_props([{ content, onPlaced }, restProps]));
  }
  $$renderer.push(`<!--]-->`);
}
function Popper_layer_inner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      onFocusOutside,
      interactOutsideBehavior = "close",
      loop,
      trapFocus = true,
      isValidEvent: isValidEvent2 = () => false,
      customAnchor = null,
      isStatic = false,
      enabled,
      ref,
      tooltip = false,
      contentPointerEvents = "auto",
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    {
      let content = function($$renderer3, { props: floatingProps, wrapperProps }) {
        if (restProps.forceMount && enabled) {
          $$renderer3.push("<!--[-->");
          Scroll_lock($$renderer3, { preventScroll });
        } else {
          $$renderer3.push("<!--[!-->");
          if (!restProps.forceMount) {
            $$renderer3.push("<!--[-->");
            Scroll_lock($$renderer3, { preventScroll });
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]-->`);
        }
        $$renderer3.push(`<!--]--> `);
        {
          let focusScope = function($$renderer4, { props: focusScopeProps }) {
            Escape_layer($$renderer4, {
              onEscapeKeydown,
              escapeKeydownBehavior,
              enabled,
              ref,
              children: ($$renderer5) => {
                {
                  let children = function($$renderer6, { props: dismissibleProps }) {
                    Text_selection_layer($$renderer6, {
                      id,
                      preventOverflowTextSelection,
                      onPointerDown,
                      onPointerUp,
                      enabled,
                      ref,
                      children: ($$renderer7) => {
                        popper?.($$renderer7, {
                          props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: contentPointerEvents } }),
                          wrapperProps
                        });
                        $$renderer7.push(`<!---->`);
                      }
                    });
                  };
                  Dismissible_layer($$renderer5, {
                    id,
                    onInteractOutside,
                    onFocusOutside,
                    interactOutsideBehavior,
                    isValidEvent: isValidEvent2,
                    enabled,
                    ref,
                    children
                  });
                }
              }
            });
          };
          Focus_scope($$renderer3, {
            onOpenAutoFocus,
            onCloseAutoFocus,
            loop,
            enabled,
            trapFocus,
            forceMount: restProps.forceMount,
            ref,
            focusScope
          });
        }
        $$renderer3.push(`<!---->`);
      };
      Popper_content($$renderer2, {
        isStatic,
        id,
        side,
        sideOffset,
        align,
        alignOffset,
        arrowPadding,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
        hideWhenDetached,
        updatePositionStrategy,
        strategy,
        dir,
        wrapperId,
        style,
        onPlaced,
        customAnchor,
        enabled,
        tooltip,
        content,
        $$slots: { content: true }
      });
    }
  });
}
function Popper_layer($$renderer, $$props) {
  let {
    popper,
    open,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    ref,
    shouldRender,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (shouldRender) {
    $$renderer.push("<!--[-->");
    Popper_layer_inner($$renderer, spread_props([
      {
        popper,
        onEscapeKeydown,
        escapeKeydownBehavior,
        preventOverflowTextSelection,
        id,
        onPointerDown,
        onPointerUp,
        side,
        sideOffset,
        align,
        alignOffset,
        arrowPadding,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
        hideWhenDetached,
        updatePositionStrategy,
        strategy,
        dir,
        preventScroll,
        wrapperId,
        style,
        onPlaced,
        customAnchor,
        isStatic,
        enabled: open,
        onInteractOutside,
        onCloseAutoFocus,
        onOpenAutoFocus,
        interactOutsideBehavior,
        loop,
        trapFocus,
        isValidEvent: isValidEvent2,
        onFocusOutside,
        forceMount: false,
        ref
      },
      restProps
    ]));
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
}
function Popper_layer_force_mount($$renderer, $$props) {
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  Popper_layer_inner($$renderer, spread_props([
    {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      isStatic,
      enabled,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      interactOutsideBehavior,
      loop,
      trapFocus,
      isValidEvent: isValidEvent2,
      onFocusOutside
    },
    restProps,
    { forceMount: true }
  ]));
}
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let isInside = false;
  const length = polygon.length;
  for (let i = 0, j = length - 1; i < length; j = i++) {
    const [xi, yi] = polygon[i] ?? [0, 0];
    const [xj, yj] = polygon[j] ?? [0, 0];
    const intersect = yi >= y !== yj >= y && x <= (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }
  return isInside;
}
function isInsideRect(point, rect) {
  return point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom;
}
function getSide(triggerRect, contentRect) {
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  const triggerCenterY = triggerRect.top + triggerRect.height / 2;
  const contentCenterX = contentRect.left + contentRect.width / 2;
  const contentCenterY = contentRect.top + contentRect.height / 2;
  const deltaX = contentCenterX - triggerCenterX;
  const deltaY = contentCenterY - triggerCenterY;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  }
  return deltaY > 0 ? "bottom" : "top";
}
class SafePolygon {
  #opts;
  #buffer;
  // tracks the cursor position when leaving trigger or content
  #exitPoint = null;
  // tracks what we're moving toward: "content" when leaving trigger, "trigger" when leaving content
  #exitTarget = null;
  constructor(opts) {
    this.#opts = opts;
    this.#buffer = opts.buffer ?? 1;
    watch([opts.triggerNode, opts.contentNode, opts.enabled], ([triggerNode, contentNode, enabled]) => {
      if (!triggerNode || !contentNode || !enabled) {
        this.#exitPoint = null;
        this.#exitTarget = null;
        return;
      }
      const doc = getDocument(triggerNode);
      const handlePointerMove = (e) => {
        this.#onPointerMove(e, triggerNode, contentNode);
      };
      const handleTriggerLeave = (e) => {
        const target = e.relatedTarget;
        if (isElement(target) && contentNode.contains(target)) {
          return;
        }
        this.#exitPoint = [e.clientX, e.clientY];
        this.#exitTarget = "content";
      };
      const handleTriggerEnter = () => {
        this.#exitPoint = null;
        this.#exitTarget = null;
      };
      const handleContentEnter = () => {
        this.#exitPoint = null;
        this.#exitTarget = null;
      };
      const handleContentLeave = (e) => {
        const target = e.relatedTarget;
        if (isElement(target) && triggerNode.contains(target)) {
          return;
        }
        this.#exitPoint = [e.clientX, e.clientY];
        this.#exitTarget = "trigger";
      };
      return [
        on(doc, "pointermove", handlePointerMove),
        on(triggerNode, "pointerleave", handleTriggerLeave),
        on(triggerNode, "pointerenter", handleTriggerEnter),
        on(contentNode, "pointerenter", handleContentEnter),
        on(contentNode, "pointerleave", handleContentLeave)
      ].reduce(
        (acc, cleanup) => () => {
          acc();
          cleanup();
        },
        () => {
        }
      );
    });
  }
  #onPointerMove(e, triggerNode, contentNode) {
    if (!this.#exitPoint || !this.#exitTarget) return;
    const clientPoint = [e.clientX, e.clientY];
    const triggerRect = triggerNode.getBoundingClientRect();
    const contentRect = contentNode.getBoundingClientRect();
    if (this.#exitTarget === "content" && isInsideRect(clientPoint, contentRect)) {
      this.#exitPoint = null;
      this.#exitTarget = null;
      return;
    }
    if (this.#exitTarget === "trigger" && isInsideRect(clientPoint, triggerRect)) {
      this.#exitPoint = null;
      this.#exitTarget = null;
      return;
    }
    const side = getSide(triggerRect, contentRect);
    const corridorPoly = this.#getCorridorPolygon(triggerRect, contentRect, side);
    if (corridorPoly && isPointInPolygon(clientPoint, corridorPoly)) {
      return;
    }
    const targetRect = this.#exitTarget === "content" ? contentRect : triggerRect;
    const safePoly = this.#getSafePolygon(this.#exitPoint, targetRect, side, this.#exitTarget);
    if (isPointInPolygon(clientPoint, safePoly)) {
      return;
    }
    this.#exitPoint = null;
    this.#exitTarget = null;
    this.#opts.onPointerExit();
  }
  /**
   * Creates a rectangular corridor between trigger and content
   * This prevents closing when cursor is in the gap between them
   */
  #getCorridorPolygon(triggerRect, contentRect, side) {
    const buffer = this.#buffer;
    switch (side) {
      case "top":
        return [
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            triggerRect.top
          ],
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            contentRect.bottom
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            contentRect.bottom
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            triggerRect.top
          ]
        ];
      case "bottom":
        return [
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            triggerRect.bottom
          ],
          [
            Math.min(triggerRect.left, contentRect.left) - buffer,
            contentRect.top
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            contentRect.top
          ],
          [
            Math.max(triggerRect.right, contentRect.right) + buffer,
            triggerRect.bottom
          ]
        ];
      case "left":
        return [
          [
            triggerRect.left,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.right,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.right,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ],
          [
            triggerRect.left,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ]
        ];
      case "right":
        return [
          [
            triggerRect.right,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.left,
            Math.min(triggerRect.top, contentRect.top) - buffer
          ],
          [
            contentRect.left,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ],
          [
            triggerRect.right,
            Math.max(triggerRect.bottom, contentRect.bottom) + buffer
          ]
        ];
    }
  }
  /**
   * Creates a triangular/trapezoidal safe zone from the exit point to the target
   */
  #getSafePolygon(exitPoint, targetRect, side, exitTarget) {
    const buffer = this.#buffer * 4;
    const [x, y] = exitPoint;
    const effectiveSide = exitTarget === "trigger" ? this.#flipSide(side) : side;
    switch (effectiveSide) {
      case "top":
        return [
          [x - buffer, y + buffer],
          [x + buffer, y + buffer],
          [targetRect.right + buffer, targetRect.bottom],
          [targetRect.right + buffer, targetRect.top],
          [targetRect.left - buffer, targetRect.top],
          [targetRect.left - buffer, targetRect.bottom]
        ];
      case "bottom":
        return [
          [x - buffer, y - buffer],
          [x + buffer, y - buffer],
          [targetRect.right + buffer, targetRect.top],
          [targetRect.right + buffer, targetRect.bottom],
          [targetRect.left - buffer, targetRect.bottom],
          [targetRect.left - buffer, targetRect.top]
        ];
      case "left":
        return [
          [x + buffer, y - buffer],
          [x + buffer, y + buffer],
          [targetRect.right, targetRect.bottom + buffer],
          [targetRect.left, targetRect.bottom + buffer],
          [targetRect.left, targetRect.top - buffer],
          [targetRect.right, targetRect.top - buffer]
        ];
      case "right":
        return [
          [x - buffer, y - buffer],
          [x - buffer, y + buffer],
          [targetRect.left, targetRect.bottom + buffer],
          [targetRect.right, targetRect.bottom + buffer],
          [targetRect.right, targetRect.top - buffer],
          [targetRect.left, targetRect.top - buffer]
        ];
    }
  }
  #flipSide(side) {
    switch (side) {
      case "top":
        return "bottom";
      case "bottom":
        return "top";
      case "left":
        return "right";
      case "right":
        return "left";
    }
  }
}
class TimeoutFn {
  #interval;
  #cb;
  #timer = null;
  constructor(cb, interval) {
    this.#cb = cb;
    this.#interval = interval;
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
    onDestroyEffect(this.stop);
  }
  #clear() {
    if (this.#timer !== null) {
      window.clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
  stop() {
    this.#clear();
  }
  start(...args) {
    this.#clear();
    this.#timer = window.setTimeout(() => {
      this.#timer = null;
      this.#cb(...args);
    }, this.#interval);
  }
}
const tooltipAttrs = createBitsAttrs({ component: "tooltip", parts: ["content", "trigger"] });
const TooltipProviderContext = new Context("Tooltip.Provider");
const TooltipRootContext = new Context("Tooltip.Root");
class TooltipProviderState {
  static create(opts) {
    return TooltipProviderContext.set(new TooltipProviderState(opts));
  }
  opts;
  isOpenDelayed = true;
  isPointerInTransit = simpleBox(false);
  #timerFn;
  #openTooltip = null;
  constructor(opts) {
    this.opts = opts;
    this.#timerFn = new TimeoutFn(
      () => {
        this.isOpenDelayed = true;
      },
      this.opts.skipDelayDuration.current
    );
  }
  #startTimer = () => {
    const skipDuration = this.opts.skipDelayDuration.current;
    if (skipDuration === 0) {
      return;
    } else {
      this.#timerFn.start();
    }
  };
  #clearTimer = () => {
    this.#timerFn.stop();
  };
  onOpen = (tooltip) => {
    if (this.#openTooltip && this.#openTooltip !== tooltip) {
      this.#openTooltip.handleClose();
    }
    this.#clearTimer();
    this.isOpenDelayed = false;
    this.#openTooltip = tooltip;
  };
  onClose = (tooltip) => {
    if (this.#openTooltip === tooltip) {
      this.#openTooltip = null;
    }
    this.#startTimer();
  };
  isTooltipOpen = (tooltip) => {
    return this.#openTooltip === tooltip;
  };
}
class TooltipRootState {
  static create(opts) {
    return TooltipRootContext.set(new TooltipRootState(opts, TooltipProviderContext.get()));
  }
  opts;
  provider;
  #delayDuration = derived(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
  get delayDuration() {
    return this.#delayDuration();
  }
  set delayDuration($$value) {
    return this.#delayDuration($$value);
  }
  #disableHoverableContent = derived(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
  get disableHoverableContent() {
    return this.#disableHoverableContent();
  }
  set disableHoverableContent($$value) {
    return this.#disableHoverableContent($$value);
  }
  #disableCloseOnTriggerClick = derived(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
  get disableCloseOnTriggerClick() {
    return this.#disableCloseOnTriggerClick();
  }
  set disableCloseOnTriggerClick($$value) {
    return this.#disableCloseOnTriggerClick($$value);
  }
  #disabled = derived(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
  get disabled() {
    return this.#disabled();
  }
  set disabled($$value) {
    return this.#disabled($$value);
  }
  #ignoreNonKeyboardFocus = derived(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
  get ignoreNonKeyboardFocus() {
    return this.#ignoreNonKeyboardFocus();
  }
  set ignoreNonKeyboardFocus($$value) {
    return this.#ignoreNonKeyboardFocus($$value);
  }
  contentNode = null;
  contentPresence;
  triggerNode = null;
  #wasOpenDelayed = false;
  #timerFn;
  #stateAttr = derived(() => {
    if (!this.opts.open.current) return "closed";
    return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
  });
  get stateAttr() {
    return this.#stateAttr();
  }
  set stateAttr($$value) {
    return this.#stateAttr($$value);
  }
  constructor(opts, provider) {
    this.opts = opts;
    this.provider = provider;
    this.#timerFn = new TimeoutFn(
      () => {
        this.#wasOpenDelayed = true;
        this.opts.open.current = true;
      },
      this.delayDuration ?? 0
    );
    this.contentPresence = new PresenceManager({
      open: this.opts.open,
      ref: boxWith(() => this.contentNode),
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
    watch(() => this.delayDuration, () => {
      if (this.delayDuration === void 0) return;
      this.#timerFn = new TimeoutFn(
        () => {
          this.#wasOpenDelayed = true;
          this.opts.open.current = true;
        },
        this.delayDuration
      );
    });
    watch(
      () => this.opts.open.current,
      (isOpen) => {
        if (isOpen) {
          this.provider.onOpen(this);
        } else {
          this.provider.onClose(this);
        }
      },
      { lazy: true }
    );
  }
  handleOpen = () => {
    this.#timerFn.stop();
    this.#wasOpenDelayed = false;
    this.opts.open.current = true;
  };
  handleClose = () => {
    this.#timerFn.stop();
    this.opts.open.current = false;
  };
  #handleDelayedOpen = () => {
    this.#timerFn.stop();
    const shouldSkipDelay = !this.provider.isOpenDelayed;
    const delayDuration = this.delayDuration ?? 0;
    if (shouldSkipDelay || delayDuration === 0) {
      this.#wasOpenDelayed = delayDuration > 0 && shouldSkipDelay;
      this.opts.open.current = true;
    } else {
      this.#timerFn.start();
    }
  };
  onTriggerEnter = () => {
    this.#handleDelayedOpen();
  };
  onTriggerLeave = () => {
    if (this.disableHoverableContent) {
      this.handleClose();
    } else {
      this.#timerFn.stop();
    }
  };
}
class TooltipTriggerState {
  static create(opts) {
    return new TooltipTriggerState(opts, TooltipRootContext.get());
  }
  opts;
  root;
  attachment;
  #isPointerDown = simpleBox(false);
  #hasPointerMoveOpened = false;
  #isDisabled = derived(() => this.opts.disabled.current || this.root.disabled);
  domContext;
  #transitCheckTimeout = null;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.domContext = new DOMContext(opts.ref);
    this.attachment = attachRef(this.opts.ref, (v) => this.root.triggerNode = v);
  }
  #clearTransitCheck = () => {
    if (this.#transitCheckTimeout !== null) {
      clearTimeout(this.#transitCheckTimeout);
      this.#transitCheckTimeout = null;
    }
  };
  handlePointerUp = () => {
    this.#isPointerDown.current = false;
  };
  #onpointerup = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = false;
  };
  #onpointerdown = () => {
    if (this.#isDisabled()) return;
    this.#isPointerDown.current = true;
    this.domContext.getDocument().addEventListener(
      "pointerup",
      () => {
        this.handlePointerUp();
      },
      { once: true }
    );
  };
  #onpointerenter = (e) => {
    if (this.#isDisabled()) return;
    if (e.pointerType === "touch") return;
    if (this.root.provider.isPointerInTransit.current) {
      this.#clearTransitCheck();
      this.#transitCheckTimeout = window.setTimeout(
        () => {
          if (this.root.provider.isPointerInTransit.current) {
            this.root.provider.isPointerInTransit.current = false;
            this.root.onTriggerEnter();
            this.#hasPointerMoveOpened = true;
          }
        },
        250
      );
      return;
    }
    this.root.onTriggerEnter();
    this.#hasPointerMoveOpened = true;
  };
  #onpointermove = (e) => {
    if (this.#isDisabled()) return;
    if (e.pointerType === "touch") return;
    if (this.#hasPointerMoveOpened) return;
    this.#clearTransitCheck();
    this.root.provider.isPointerInTransit.current = false;
    this.root.onTriggerEnter();
    this.#hasPointerMoveOpened = true;
  };
  #onpointerleave = () => {
    if (this.#isDisabled()) return;
    this.#clearTransitCheck();
    this.root.onTriggerLeave();
    this.#hasPointerMoveOpened = false;
  };
  #onfocus = (e) => {
    if (this.#isPointerDown.current || this.#isDisabled()) return;
    if (this.root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
    this.root.handleOpen();
  };
  #onblur = () => {
    if (this.#isDisabled()) return;
    this.root.handleClose();
  };
  #onclick = () => {
    if (this.root.disableCloseOnTriggerClick || this.#isDisabled()) return;
    this.root.handleClose();
  };
  #props = derived(() => ({
    id: this.opts.id.current,
    "aria-describedby": this.root.opts.open.current ? this.root.contentNode?.id : void 0,
    "data-state": this.root.stateAttr,
    "data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
    "data-delay-duration": `${this.root.delayDuration}`,
    [tooltipAttrs.trigger]: "",
    tabindex: this.#isDisabled() ? void 0 : 0,
    disabled: this.opts.disabled.current,
    onpointerup: this.#onpointerup,
    onpointerdown: this.#onpointerdown,
    onpointerenter: this.#onpointerenter,
    onpointermove: this.#onpointermove,
    onpointerleave: this.#onpointerleave,
    onfocus: this.#onfocus,
    onblur: this.#onblur,
    onclick: this.#onclick,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class TooltipContentState {
  static create(opts) {
    return new TooltipContentState(opts, TooltipRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
    new SafePolygon({
      triggerNode: () => this.root.triggerNode,
      contentNode: () => this.root.contentNode,
      enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
      onPointerExit: () => {
        if (this.root.provider.isTooltipOpen(this.root)) {
          this.root.handleClose();
        }
      }
    });
  }
  onInteractOutside = (e) => {
    if (isElement(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current?.(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  get shouldRender() {
    return this.root.contentPresence.shouldRender;
  }
  #snippetProps = derived(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived(() => ({
    id: this.opts.id.current,
    "data-state": this.root.stateAttr,
    "data-disabled": boolToEmptyStrOrUndef(this.root.disabled),
    style: { outline: "none" },
    [tooltipAttrs.content]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus
  };
}
function Tooltip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = false,
      onOpenChange = noop,
      onOpenChangeComplete = noop,
      disabled,
      delayDuration,
      disableCloseOnTriggerClick,
      disableHoverableContent,
      ignoreNonKeyboardFocus,
      children
    } = $$props;
    TooltipRootState.create({
      open: boxWith(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      delayDuration: boxWith(() => delayDuration),
      disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
      disableHoverableContent: boxWith(() => disableHoverableContent),
      ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
      disabled: boxWith(() => disabled),
      onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
    });
    Floating_layer($$renderer2, {
      tooltip: true,
      children: ($$renderer3) => {
        children?.($$renderer3);
        $$renderer3.push(`<!---->`);
      }
    });
    bind_props($$props, { open });
  });
}
function Tooltip_content$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      ref = null,
      side = "top",
      sideOffset = 0,
      align = "center",
      avoidCollisions = true,
      arrowPadding = 0,
      sticky = "partial",
      strategy,
      hideWhenDetached = false,
      collisionPadding = 0,
      onInteractOutside = noop,
      onEscapeKeydown = noop,
      forceMount = false,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const contentState = TooltipContentState.create({
      id: boxWith(() => id),
      ref: boxWith(() => ref, (v) => ref = v),
      onInteractOutside: boxWith(() => onInteractOutside),
      onEscapeKeydown: boxWith(() => onEscapeKeydown)
    });
    const floatingProps = {
      side,
      sideOffset,
      align,
      avoidCollisions,
      arrowPadding,
      sticky,
      hideWhenDetached,
      collisionPadding,
      strategy
    };
    const mergedProps = mergeProps(restProps, floatingProps, contentState.props);
    if (forceMount) {
      $$renderer2.push("<!--[-->");
      {
        let popper = function($$renderer3, { props, wrapperProps }) {
          const mergedProps2 = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") });
          if (child) {
            $$renderer3.push("<!--[-->");
            child($$renderer3, {
              props: mergedProps2,
              wrapperProps,
              ...contentState.snippetProps
            });
            $$renderer3.push(`<!---->`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...mergedProps2 })}>`);
            children?.($$renderer3);
            $$renderer3.push(`<!----></div></div>`);
          }
          $$renderer3.push(`<!--]-->`);
        };
        Popper_layer_force_mount($$renderer2, spread_props([
          mergedProps,
          contentState.popperProps,
          {
            enabled: contentState.root.opts.open.current,
            id,
            trapFocus: false,
            loop: false,
            preventScroll: false,
            forceMount: true,
            ref: contentState.opts.ref,
            tooltip: true,
            shouldRender: contentState.shouldRender,
            contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$renderer2.push("<!--[!-->");
      if (!forceMount) {
        $$renderer2.push("<!--[-->");
        {
          let popper = function($$renderer3, { props, wrapperProps }) {
            const mergedProps2 = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") });
            if (child) {
              $$renderer3.push("<!--[-->");
              child($$renderer3, {
                props: mergedProps2,
                wrapperProps,
                ...contentState.snippetProps
              });
              $$renderer3.push(`<!---->`);
            } else {
              $$renderer3.push("<!--[!-->");
              $$renderer3.push(`<div${attributes({ ...wrapperProps })}><div${attributes({ ...mergedProps2 })}>`);
              children?.($$renderer3);
              $$renderer3.push(`<!----></div></div>`);
            }
            $$renderer3.push(`<!--]-->`);
          };
          Popper_layer($$renderer2, spread_props([
            mergedProps,
            contentState.popperProps,
            {
              open: contentState.root.opts.open.current,
              id,
              trapFocus: false,
              loop: false,
              preventScroll: false,
              forceMount: false,
              ref: contentState.opts.ref,
              tooltip: true,
              shouldRender: contentState.shouldRender,
              contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
              popper,
              $$slots: { popper: true }
            }
          ]));
        }
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { ref });
  });
}
function Tooltip_trigger$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const uid = props_id($$renderer2);
    let {
      children,
      child,
      id = createId(uid),
      disabled = false,
      type = "button",
      ref = null,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    const triggerState = TooltipTriggerState.create({
      id: boxWith(() => id),
      disabled: boxWith(() => disabled ?? false),
      ref: boxWith(() => ref, (v) => ref = v)
    });
    const mergedProps = mergeProps(restProps, triggerState.props, { type });
    Floating_layer_anchor($$renderer2, {
      id,
      ref: triggerState.opts.ref,
      tooltip: true,
      children: ($$renderer3) => {
        if (child) {
          $$renderer3.push("<!--[-->");
          child($$renderer3, { props: mergedProps });
          $$renderer3.push(`<!---->`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<button${attributes({ ...mergedProps })}>`);
          children?.($$renderer3);
          $$renderer3.push(`<!----></button>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
    bind_props($$props, { ref });
  });
}
function Tooltip_arrow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      Floating_layer_arrow($$renderer3, spread_props([
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Tooltip_provider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      children,
      delayDuration = 700,
      disableCloseOnTriggerClick = false,
      disableHoverableContent = false,
      disabled = false,
      ignoreNonKeyboardFocus = false,
      skipDelayDuration = 300
    } = $$props;
    TooltipProviderState.create({
      delayDuration: boxWith(() => delayDuration),
      disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
      disableHoverableContent: boxWith(() => disableHoverableContent),
      disabled: boxWith(() => disabled),
      ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
      skipDelayDuration: boxWith(() => skipDelayDuration)
    });
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
function Tooltip_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Tooltip_trigger$1($$renderer3, spread_props([
        { "data-slot": "tooltip-trigger" },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Tooltip_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      class: className,
      sideOffset = 0,
      side = "top",
      children,
      arrowClasses,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Portal($$renderer3, {
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Tooltip_content$1($$renderer4, spread_props([
            {
              "data-slot": "tooltip-content",
              sideOffset,
              side,
              class: cn("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-tooltip-content-transform-origin) z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$renderer5) => {
                children?.($$renderer5);
                $$renderer5.push(`<!----> <!---->`);
                {
                  let child = function($$renderer6, { props }) {
                    $$renderer6.push(`<div${attributes({
                      class: clsx(cn("bg-primary z-50 size-2.5 rotate-45 rounded-[2px]", "data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%_+_2px)]", "data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%_+_1px)]", "data-[side=right]:translate-x-[calc(50%_+_2px)] data-[side=right]:translate-y-1/2", "data-[side=left]:-translate-y-[calc(50%_-_3px)]", arrowClasses)),
                      ...props
                    })}></div>`);
                  };
                  Tooltip_arrow($$renderer5, { child, $$slots: { child: true } });
                }
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            }
          ]));
          $$renderer4.push(`<!---->`);
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
const Root = Tooltip;
const Provider = Tooltip_provider;
function Collapsible($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, open = false, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Collapsible$1($$renderer3, spread_props([
        { "data-slot": "collapsible" },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          get open() {
            return open;
          },
          set open($$value) {
            open = $$value;
            $$settled = false;
          }
        }
      ]));
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref, open });
  });
}
function Collapsible_trigger($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Collapsible_trigger$1($$renderer3, spread_props([
        { "data-slot": "collapsible-trigger" },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
function Collapsible_content($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { ref = null, $$slots, $$events, ...restProps } = $$props;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Collapsible_content$1($$renderer3, spread_props([
        { "data-slot": "collapsible-content" },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          }
        }
      ]));
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
const badgeVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive: "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white",
      outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      success: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 [a&]:hover:bg-green-500/20",
      muted: "bg-gray-100 text-gray-600 border-gray-200"
    }
  },
  defaultVariants: { variant: "default" }
});
function Badge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      ref = null,
      href,
      class: className,
      variant = "default",
      children,
      $$slots,
      $$events,
      ...restProps
    } = $$props;
    element(
      $$renderer2,
      href ? "a" : "span",
      () => {
        $$renderer2.push(`${attributes({
          "data-slot": "badge",
          href,
          class: clsx(cn(badgeVariants({ variant }), className)),
          ...restProps
        })}`);
      },
      () => {
        children?.($$renderer2);
        $$renderer2.push(`<!---->`);
      }
    );
    bind_props($$props, { ref });
  });
}
function RowValue($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { row, size: size2 = "sm", class: className = "" } = $$props;
    function getBadgeVariant(row2) {
      if (!row2.badge) return "outline";
      const variant = row2.badge.variant;
      if (variant === "muted") return "muted";
      if (variant === "success") return "success";
      return variant;
    }
    const isStatusBadge = row.badge?.label && ["Enabled", "Disabled", "Yes", "No", "On", "Off"].includes(row.badge.label);
    const sizeClasses = {
      // Status badges get min-width for alignment, regular badges don't
      badge: size2 === "sm" ? `h-4 text-[9px] ${isStatusBadge ? "min-w-14 text-center" : ""}` : `h-5 text-[10px] ${isStatusBadge ? "min-w-16 text-center" : ""}`,
      copyButton: size2 === "sm" ? "h-auto min-h-6 px-1 font-mono text-[10px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left" : "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
      datetime: size2 === "sm" ? "font-mono text-[10px] text-muted-foreground" : "font-mono text-[11px] text-muted-foreground",
      text: size2 === "sm" ? "font-medium" : "font-medium"
    };
    if (row.badge) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: getBadgeVariant(row),
        class: `${stringify(sizeClasses.badge)} ${stringify(className)}`,
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(row.badge.label)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      if (row.type === "path" || row.type === "uuid") {
        $$renderer2.push("<!--[-->");
        Copy_button($$renderer2, {
          text: row.value || "",
          size: "sm",
          variant: "ghost",
          class: `${stringify(sizeClasses.copyButton)} ${stringify(className)}`,
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(row.value)}`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer2.push("<!--[!-->");
        if (row.type === "datetime") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span${attr_class(`${stringify(sizeClasses.datetime)} ${stringify(className)}`)}>${escape_html(row.value)}</span>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span${attr_class(`${stringify(sizeClasses.text)} ${stringify(className)}`)}>${escape_html(row.value)}</span>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function scrollToMarker(markerId) {
  const el = document.querySelector(`[data-marker-id="${markerId}"]`);
  if (!el) {
    console.warn(`[PRV] scrollToMarker: element with data-marker-id="${markerId}" not found`);
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("marker-highlight-flash");
  setTimeout(
    () => {
      el.classList.remove("marker-highlight-flash");
    },
    1500
  );
}
function CompactCurrentVm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node, markers = [] } = $$props;
    let networksOpen = false;
    let hddsOpen = false;
    let usbOpen = false;
    let cdOpen = false;
    function getSection(title) {
      return node.sections.find((s) => s.title === title);
    }
    const startupSection = getSection("Startup / Shutdown");
    const generalSection = getSection("General");
    const hardwareSection = getSection("Hardware");
    const sharingSection = getSection("Sharing");
    const networkSubs = hardwareSection?.subSections?.find((s) => s.title === "Networks");
    const hddSubs = hardwareSection?.subSections?.find((s) => s.title === "HDDs");
    const usbSubs = hardwareSection?.subSections?.find((s) => s.title === "USBs");
    const cdSubs = hardwareSection?.subSections?.find((s) => s.title === "CD / DVD");
    const networkMarkers = getMarkersForSubSection(markers, node.id, "Hardware", "networks");
    const hddMarkers = getMarkersForSubSection(markers, node.id, "Hardware", "hdds");
    const usbMarkers = getMarkersForSubSection(markers, node.id, "Hardware", "usbs");
    const cdMarkers = getMarkersForSubSection(markers, node.id, "Hardware", "cds");
    function groupByLabelStart(rows, startLabel) {
      if (!rows || rows.length === 0) return [];
      const groups = [];
      let current = [];
      let idx = 0;
      for (const row of rows) {
        if (row.label === startLabel && current.length > 0) {
          groups.push({ key: String(idx++), rows: current });
          current = [];
        }
        current.push(row);
      }
      if (current.length > 0) groups.push({ key: String(idx++), rows: current });
      return groups;
    }
    const hddGroups = groupByLabelStart(hddSubs?.rows, "Location");
    function handleMarkerClick(marker) {
      scrollToMarker(marker.id);
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Provider($$renderer3, {
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="compact-current-vm space-y-3 svelte-ztjt5x">`);
          if (generalSection) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<section class="space-y-2 svelte-ztjt5x"><h3 class="text-xs font-bold text-foreground svelte-ztjt5x">${escape_html(generalSection.title)}</h3> <div class="space-y-1 text-xs svelte-ztjt5x"><!--[-->`);
            const each_array = ensure_array_like(generalSection.rows);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let row = each_array[$$index];
              $$renderer4.push(`<div class="flex items-start justify-between gap-2 svelte-ztjt5x"><span class="text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
              RowValue($$renderer4, { row, size: "sm" });
              $$renderer4.push(`<!----></div>`);
            }
            $$renderer4.push(`<!--]--></div></section>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (startupSection) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<section class="space-y-2 svelte-ztjt5x"><h3 class="text-xs font-bold text-foreground svelte-ztjt5x">${escape_html(startupSection.title)}</h3> <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs svelte-ztjt5x"><!--[-->`);
            const each_array_1 = ensure_array_like(startupSection.rows);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let row = each_array_1[$$index_1];
              $$renderer4.push(`<div class="flex items-center justify-between svelte-ztjt5x"><span class="text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
              RowValue($$renderer4, { row, size: "md" });
              $$renderer4.push(`<!----></div>`);
            }
            $$renderer4.push(`<!--]--></div></section>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (hardwareSection) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<section class="space-y-2 svelte-ztjt5x"><h3 class="text-xs font-bold text-foreground svelte-ztjt5x">Hardware</h3> <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs svelte-ztjt5x"><!--[-->`);
            const each_array_2 = ensure_array_like(hardwareSection.rows);
            for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
              let row = each_array_2[i];
              if (i > 0) {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<span class="text-muted-foreground/40 svelte-ztjt5x">•</span>`);
              } else {
                $$renderer4.push("<!--[!-->");
              }
              $$renderer4.push(`<!--]--> <!---->`);
              Root($$renderer4, {
                children: ($$renderer5) => {
                  $$renderer5.push(`<!---->`);
                  Tooltip_trigger($$renderer5, {
                    class: "inline-flex items-center gap-1",
                    children: ($$renderer6) => {
                      if (row.iconKey === "cpu") {
                        $$renderer6.push("<!--[-->");
                        Cpu($$renderer6, { class: "h-3.5 w-3.5 text-muted-foreground" });
                      } else {
                        $$renderer6.push("<!--[!-->");
                        if (row.iconKey === "monitor") {
                          $$renderer6.push("<!--[-->");
                          Monitor($$renderer6, { class: "h-3.5 w-3.5 text-muted-foreground" });
                        } else {
                          $$renderer6.push("<!--[!-->");
                          if (row.iconKey === "keyboard" || row.iconKey === "mouse") {
                            $$renderer6.push("<!--[-->");
                            Settings($$renderer6, { class: "h-3.5 w-3.5 text-muted-foreground" });
                          } else {
                            $$renderer6.push("<!--[!-->");
                          }
                          $$renderer6.push(`<!--]-->`);
                        }
                        $$renderer6.push(`<!--]-->`);
                      }
                      $$renderer6.push(`<!--]--> <span class="font-medium svelte-ztjt5x">${escape_html(row.label)}:</span> `);
                      RowValue($$renderer6, { row, size: "sm" });
                      $$renderer6.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!----> <!---->`);
                  Tooltip_content($$renderer5, {
                    children: ($$renderer6) => {
                      $$renderer6.push(`<p class="max-w-[250px] text-xs svelte-ztjt5x">${escape_html(row.label)}: ${escape_html(row.value || row.badge?.label)}</p>`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer5.push(`<!---->`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!---->`);
            }
            $$renderer4.push(`<!--]--></div></section>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (networkSubs && networkSubs.rows.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<!---->`);
            Collapsible($$renderer4, {
              get open() {
                return networksOpen;
              },
              set open($$value) {
                networksOpen = $$value;
                $$settled = false;
              },
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->`);
                Collapsible_trigger($$renderer5, {
                  class: "flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent",
                  "data-marker-id": "networks-section",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center gap-2 svelte-ztjt5x">`);
                    Network($$renderer6, { class: "h-3.5 w-3.5" });
                    $$renderer6.push(`<!----> <span class="svelte-ztjt5x">${escape_html(networkSubs.title)}</span> <!--[-->`);
                    const each_array_3 = ensure_array_like(networkMarkers);
                    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
                      let marker = each_array_3[$$index_3];
                      $$renderer6.push(`<!---->`);
                      Root($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->`);
                          Tooltip_trigger($$renderer7, {
                            children: ($$renderer8) => {
                              Badge($$renderer8, {
                                variant: severityToVariant(marker.severity),
                                class: "h-4 px-1.5 text-[9px] cursor-pointer",
                                onclick: (e) => {
                                  e.stopPropagation();
                                  handleMarkerClick(marker);
                                },
                                children: ($$renderer9) => {
                                  if (marker.severity === "danger" || marker.severity === "warn") {
                                    $$renderer9.push("<!--[-->");
                                    Triangle_alert($$renderer9, { class: "h-2.5 w-2.5 mr-0.5" });
                                  } else {
                                    $$renderer9.push("<!--[!-->");
                                  }
                                  $$renderer9.push(`<!--]--> ${escape_html(marker.label)}`);
                                },
                                $$slots: { default: true }
                              });
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----> <!---->`);
                          Tooltip_content($$renderer7, {
                            children: ($$renderer8) => {
                              $$renderer8.push(`<p class="text-xs svelte-ztjt5x">${escape_html(marker.tooltip || marker.label)}</p>`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    }
                    $$renderer6.push(`<!--]--></div> <span class="text-lg svelte-ztjt5x">${escape_html(networksOpen ? "−" : "+")}</span>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> <!---->`);
                Collapsible_content($$renderer5, {
                  class: "mt-2 ml-4",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="rounded-md border border-border/50 bg-muted/20 p-3 svelte-ztjt5x" data-marker-id="disconnected-adapter-subsection"><div class="space-y-0.5 text-[11px] svelte-ztjt5x"><!--[-->`);
                    const each_array_4 = ensure_array_like(networkSubs.rows);
                    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
                      let row = each_array_4[$$index_4];
                      $$renderer6.push(`<div class="flex items-center justify-between svelte-ztjt5x"><span class="text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
                      RowValue($$renderer6, { row, size: "sm" });
                      $$renderer6.push(`<!----></div>`);
                    }
                    $$renderer6.push(`<!--]--></div></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (hddSubs && hddSubs.rows.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<!---->`);
            Collapsible($$renderer4, {
              get open() {
                return hddsOpen;
              },
              set open($$value) {
                hddsOpen = $$value;
                $$settled = false;
              },
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->`);
                Collapsible_trigger($$renderer5, {
                  class: "flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent",
                  "data-marker-id": "hdds-section",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center gap-2 svelte-ztjt5x">`);
                    Hard_drive($$renderer6, { class: "h-3.5 w-3.5" });
                    $$renderer6.push(`<!----> <span class="svelte-ztjt5x">${escape_html(hddSubs.title)}</span> <!--[-->`);
                    const each_array_5 = ensure_array_like(hddMarkers);
                    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
                      let marker = each_array_5[$$index_5];
                      $$renderer6.push(`<!---->`);
                      Root($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->`);
                          Tooltip_trigger($$renderer7, {
                            children: ($$renderer8) => {
                              Badge($$renderer8, {
                                variant: severityToVariant(marker.severity),
                                class: "h-4 px-1.5 text-[9px] cursor-pointer",
                                onclick: (e) => {
                                  e.stopPropagation();
                                  handleMarkerClick(marker);
                                },
                                children: ($$renderer9) => {
                                  if (marker.severity === "danger" || marker.severity === "warn") {
                                    $$renderer9.push("<!--[-->");
                                    Triangle_alert($$renderer9, { class: "h-2.5 w-2.5 mr-0.5" });
                                  } else {
                                    $$renderer9.push("<!--[!-->");
                                  }
                                  $$renderer9.push(`<!--]--> ${escape_html(marker.label)}`);
                                },
                                $$slots: { default: true }
                              });
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----> <!---->`);
                          Tooltip_content($$renderer7, {
                            children: ($$renderer8) => {
                              $$renderer8.push(`<p class="text-xs svelte-ztjt5x">${escape_html(marker.tooltip || marker.label)}</p>`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    }
                    $$renderer6.push(`<!--]--></div> <span class="text-lg svelte-ztjt5x">${escape_html(hddsOpen ? "−" : "+")}</span>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> <!---->`);
                Collapsible_content($$renderer5, {
                  class: "mt-2 ml-4",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="space-y-2 svelte-ztjt5x" data-marker-id="no-hdd-subsection"><!--[-->`);
                    const each_array_6 = ensure_array_like(hddGroups);
                    for (let groupIndex = 0, $$length = each_array_6.length; groupIndex < $$length; groupIndex++) {
                      let group = each_array_6[groupIndex];
                      const externalRow = group.rows.find((r) => r.label === "External to PVM");
                      $$renderer6.push(`<div class="rounded-md border border-border/50 bg-muted/20 p-3 svelte-ztjt5x"><div class="mb-2 flex items-center justify-between gap-2 svelte-ztjt5x"><div class="text-xs font-semibold text-foreground/80 svelte-ztjt5x">Disk ${escape_html(groupIndex + 1)}</div> `);
                      if (externalRow) {
                        $$renderer6.push("<!--[-->");
                        RowValue($$renderer6, { row: externalRow, size: "sm", class: "shrink-0" });
                      } else {
                        $$renderer6.push("<!--[!-->");
                      }
                      $$renderer6.push(`<!--]--></div> <div class="space-y-0.5 text-[11px] svelte-ztjt5x"><!--[-->`);
                      const each_array_7 = ensure_array_like(group.rows);
                      for (let $$index_6 = 0, $$length2 = each_array_7.length; $$index_6 < $$length2; $$index_6++) {
                        let row = each_array_7[$$index_6];
                        $$renderer6.push(`<div class="flex items-center justify-between gap-3 svelte-ztjt5x"><span class="min-w-0 text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
                        RowValue($$renderer6, { row, size: "sm", class: "max-w-[65%]" });
                        $$renderer6.push(`<!----></div>`);
                      }
                      $$renderer6.push(`<!--]--></div></div>`);
                    }
                    $$renderer6.push(`<!--]--></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (usbSubs && usbSubs.rows.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<!---->`);
            Collapsible($$renderer4, {
              get open() {
                return usbOpen;
              },
              set open($$value) {
                usbOpen = $$value;
                $$settled = false;
              },
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->`);
                Collapsible_trigger($$renderer5, {
                  class: "flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent",
                  "data-marker-id": "usbs-section",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center gap-2 svelte-ztjt5x">`);
                    Usb($$renderer6, { class: "h-3.5 w-3.5" });
                    $$renderer6.push(`<!----> <span class="svelte-ztjt5x">${escape_html(usbSubs.title)}</span> <!--[-->`);
                    const each_array_8 = ensure_array_like(usbMarkers);
                    for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
                      let marker = each_array_8[$$index_8];
                      $$renderer6.push(`<!---->`);
                      Root($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->`);
                          Tooltip_trigger($$renderer7, {
                            children: ($$renderer8) => {
                              Badge($$renderer8, {
                                variant: severityToVariant(marker.severity),
                                class: "h-4 px-1.5 text-[9px] cursor-pointer",
                                onclick: (e) => {
                                  e.stopPropagation();
                                  handleMarkerClick(marker);
                                },
                                children: ($$renderer9) => {
                                  $$renderer9.push(`<!---->${escape_html(marker.label)}`);
                                },
                                $$slots: { default: true }
                              });
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----> <!---->`);
                          Tooltip_content($$renderer7, {
                            children: ($$renderer8) => {
                              $$renderer8.push(`<p class="text-xs svelte-ztjt5x">${escape_html(marker.tooltip || marker.label)}</p>`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    }
                    $$renderer6.push(`<!--]--></div> <span class="text-lg svelte-ztjt5x">${escape_html(usbOpen ? "−" : "+")}</span>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> <!---->`);
                Collapsible_content($$renderer5, {
                  class: "mt-2 ml-4",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="space-y-2 svelte-ztjt5x"><!--[-->`);
                    const each_array_9 = ensure_array_like(usbSubs.rows);
                    for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
                      let row = each_array_9[$$index_9];
                      $$renderer6.push(`<div class="rounded-md border border-border/50 bg-muted/20 p-3 svelte-ztjt5x"><div class="mb-1 text-xs font-semibold svelte-ztjt5x">${escape_html(row.label)}</div> `);
                      if (row.value) {
                        $$renderer6.push("<!--[-->");
                        $$renderer6.push(`<div class="text-[11px] text-muted-foreground svelte-ztjt5x">${escape_html(row.value)}</div>`);
                      } else {
                        $$renderer6.push("<!--[!-->");
                      }
                      $$renderer6.push(`<!--]--></div>`);
                    }
                    $$renderer6.push(`<!--]--></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (cdSubs && cdSubs.rows.length > 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<!---->`);
            Collapsible($$renderer4, {
              get open() {
                return cdOpen;
              },
              set open($$value) {
                cdOpen = $$value;
                $$settled = false;
              },
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->`);
                Collapsible_trigger($$renderer5, {
                  class: "flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent",
                  "data-marker-id": "cds-section",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="flex items-center gap-2 svelte-ztjt5x">`);
                    Disc($$renderer6, { class: "h-3.5 w-3.5" });
                    $$renderer6.push(`<!----> <span class="svelte-ztjt5x">${escape_html(cdSubs.title)}</span> <!--[-->`);
                    const each_array_10 = ensure_array_like(cdMarkers);
                    for (let $$index_10 = 0, $$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
                      let marker = each_array_10[$$index_10];
                      $$renderer6.push(`<!---->`);
                      Root($$renderer6, {
                        children: ($$renderer7) => {
                          $$renderer7.push(`<!---->`);
                          Tooltip_trigger($$renderer7, {
                            children: ($$renderer8) => {
                              Badge($$renderer8, {
                                variant: severityToVariant(marker.severity),
                                class: "h-4 px-1.5 text-[9px] cursor-pointer",
                                onclick: (e) => {
                                  e.stopPropagation();
                                  handleMarkerClick(marker);
                                },
                                children: ($$renderer9) => {
                                  $$renderer9.push(`<!---->${escape_html(marker.label)}`);
                                },
                                $$slots: { default: true }
                              });
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!----> <!---->`);
                          Tooltip_content($$renderer7, {
                            children: ($$renderer8) => {
                              $$renderer8.push(`<p class="text-xs svelte-ztjt5x">${escape_html(marker.tooltip || marker.label)}</p>`);
                            },
                            $$slots: { default: true }
                          });
                          $$renderer7.push(`<!---->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer6.push(`<!---->`);
                    }
                    $$renderer6.push(`<!--]--></div> <span class="text-lg svelte-ztjt5x">${escape_html(cdOpen ? "−" : "+")}</span>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> <!---->`);
                Collapsible_content($$renderer5, {
                  class: "mt-2 ml-4",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<div class="rounded-md border border-border/50 bg-muted/20 p-3 svelte-ztjt5x"><div class="space-y-0.5 text-[11px] svelte-ztjt5x"><!--[-->`);
                    const each_array_11 = ensure_array_like(cdSubs.rows);
                    for (let $$index_11 = 0, $$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
                      let row = each_array_11[$$index_11];
                      $$renderer6.push(`<div class="flex items-center justify-between svelte-ztjt5x"><span class="text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
                      RowValue($$renderer6, { row, size: "sm" });
                      $$renderer6.push(`<!----></div>`);
                    }
                    $$renderer6.push(`<!--]--></div></div>`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (sharingSection) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<section class="space-y-2 svelte-ztjt5x"><h3 class="text-xs font-bold text-foreground svelte-ztjt5x">${escape_html(sharingSection.title)}</h3> <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs svelte-ztjt5x"><!--[-->`);
            const each_array_12 = ensure_array_like(sharingSection.rows);
            for (let $$index_12 = 0, $$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
              let row = each_array_12[$$index_12];
              $$renderer4.push(`<div class="flex items-center justify-between svelte-ztjt5x"><span class="text-muted-foreground svelte-ztjt5x">${escape_html(row.label)}</span> `);
              RowValue($$renderer4, { row, size: "md" });
              $$renderer4.push(`<!----></div>`);
            }
            $$renderer4.push(`<!--]--></div></section>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div>`);
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Unix_permissions($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { permissions = null, variant = "rich", class: className } = $$props;
    const TRIAD_UI = {
      owner: {
        container: "bg-blue-100 border-blue-500",
        activeText: "text-blue-900",
        labelCell: "bg-blue-50 border-blue-500",
        labelText: "text-blue-900"
      },
      group: {
        container: "bg-emerald-100 border-emerald-500",
        activeText: "text-emerald-900",
        labelCell: "bg-emerald-50 border-emerald-500",
        labelText: "text-emerald-900"
      },
      others: {
        container: "bg-amber-100 border-amber-500",
        activeText: "text-amber-900",
        labelCell: "bg-amber-50 border-amber-500",
        labelText: "text-amber-900"
      }
    };
    function parseTriad(raw) {
      const r = raw[0] ?? "-";
      const w = raw[1] ?? "-";
      const x = raw[2] ?? "-";
      return {
        raw: `${r}${w}${x}`,
        read: r === "r",
        write: w === "w",
        // Treat `s`/`t` as "execute on" (setuid/sticky etc). Keep `S`/`T` as not-executable.
        execute: x === "x" || x === "s" || x === "t"
      };
    }
    function triadToOctal(triad) {
      return (triad.read ? 4 : 0) + (triad.write ? 2 : 0) + (triad.execute ? 1 : 0);
    }
    function parsePermissionsString(input) {
      const raw = input?.trim() ?? "";
      if (raw.length < 10) return null;
      const fileType = raw[0] ?? "?";
      const owner = parseTriad(raw.slice(1, 4));
      const group = parseTriad(raw.slice(4, 7));
      const others = parseTriad(raw.slice(7, 10));
      const suffix = raw.slice(10);
      const octal = `${triadToOctal(owner)}${triadToOctal(group)}${triadToOctal(others)}`;
      return { raw, fileType, owner, group, others, octal, suffix };
    }
    function permCharClass(active, activeTextClass) {
      return cn("font-mono text-xs leading-none", active ? cn(activeTextClass, "font-semibold opacity-100") : "text-slate-300 font-normal opacity-50");
    }
    function iconCell(allowed) {
      if (allowed) return { Icon: Check, class: "text-emerald-600" };
      return { Icon: Minus, class: "text-slate-300" };
    }
    let parsed = parsePermissionsString(permissions);
    let legendRows = parsed ? [
      {
        key: "owner",
        label: "Owner",
        perms: parsed.owner,
        ui: TRIAD_UI.owner
      },
      {
        key: "group",
        label: "Group",
        perms: parsed.group,
        ui: TRIAD_UI.group
      },
      {
        key: "others",
        label: "Others",
        perms: parsed.others,
        ui: TRIAD_UI.others
      }
    ] : [];
    $$renderer2.push(`<!---->`);
    Provider($$renderer2, {
      delayDuration: 100,
      skipDelayDuration: 0,
      disableHoverableContent: true,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->`);
        Root($$renderer3, {
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->`);
            {
              let child = function($$renderer5, { props }) {
                if (variant === "subtle") {
                  $$renderer5.push("<!--[-->");
                  $$renderer5.push(`<span${attributes({
                    ...props,
                    role: "button",
                    tabindex: "0",
                    class: clsx(cn("inline-flex cursor-help items-center rounded-sm font-mono text-[11px] text-slate-500", "hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400/40", className))
                  })}>${escape_html(permissions?.trim() || "—")}</span>`);
                } else {
                  $$renderer5.push("<!--[!-->");
                  $$renderer5.push(`<span${attributes({
                    ...props,
                    role: "button",
                    tabindex: "0",
                    class: clsx(cn("inline-flex cursor-help items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-800 shadow-none outline-none", "hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400/40", className))
                  })}>`);
                  if (parsed) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.push(`<span class="text-slate-500 pr-1">${escape_html(parsed.fileType)}</span> <span${attr_class(clsx(cn("inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2", TRIAD_UI.owner.container)))}><span${attr_class(clsx(permCharClass(parsed.owner.read, TRIAD_UI.owner.activeText)))}>${escape_html(parsed.owner.raw[0])}</span> <span${attr_class(clsx(permCharClass(parsed.owner.write, TRIAD_UI.owner.activeText)))}>${escape_html(parsed.owner.raw[1])}</span> <span${attr_class(clsx(permCharClass(parsed.owner.execute, TRIAD_UI.owner.activeText)))}>${escape_html(parsed.owner.raw[2])}</span></span> <span${attr_class(clsx(cn("inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2", TRIAD_UI.group.container)))}><span${attr_class(clsx(permCharClass(parsed.group.read, TRIAD_UI.group.activeText)))}>${escape_html(parsed.group.raw[0])}</span> <span${attr_class(clsx(permCharClass(parsed.group.write, TRIAD_UI.group.activeText)))}>${escape_html(parsed.group.raw[1])}</span> <span${attr_class(clsx(permCharClass(parsed.group.execute, TRIAD_UI.group.activeText)))}>${escape_html(parsed.group.raw[2])}</span></span> <span${attr_class(clsx(cn("inline-flex items-center gap-[1px] rounded-[3px] px-1 py-0.5 border-b-2", TRIAD_UI.others.container)))}><span${attr_class(clsx(permCharClass(parsed.others.read, TRIAD_UI.others.activeText)))}>${escape_html(parsed.others.raw[0])}</span> <span${attr_class(clsx(permCharClass(parsed.others.write, TRIAD_UI.others.activeText)))}>${escape_html(parsed.others.raw[1])}</span> <span${attr_class(clsx(permCharClass(parsed.others.execute, TRIAD_UI.others.activeText)))}>${escape_html(parsed.others.raw[2])}</span></span> <span class="ml-2 text-[11px] font-semibold text-slate-400">${escape_html(parsed.octal)}</span> `);
                    if (parsed.suffix) {
                      $$renderer5.push("<!--[-->");
                      $$renderer5.push(`<span class="ml-0.5 text-[11px] font-semibold text-slate-400">${escape_html(parsed.suffix)}</span>`);
                    } else {
                      $$renderer5.push("<!--[!-->");
                    }
                    $$renderer5.push(`<!--]-->`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                    $$renderer5.push(`<span class="text-slate-500">${escape_html(permissions?.trim() || "—")}</span>`);
                  }
                  $$renderer5.push(`<!--]--></span>`);
                }
                $$renderer5.push(`<!--]-->`);
              };
              Tooltip_trigger($$renderer4, { type: void 0, child, $$slots: { child: true } });
            }
            $$renderer4.push(`<!----> `);
            if (parsed) {
              $$renderer4.push("<!--[-->");
              $$renderer4.push(`<!---->`);
              Tooltip_content($$renderer4, {
                side: "bottom",
                sideOffset: 8,
                arrowClasses: "bg-white",
                class: "bg-white text-slate-800 border border-slate-200 p-0 shadow-xl",
                children: ($$renderer5) => {
                  $$renderer5.push(`<table class="min-w-72 w-full border-collapse text-sm"><thead><tr class="bg-slate-50 text-slate-600"><th class="px-3 py-2 text-left font-semibold"></th><th class="px-3 py-2 text-center font-semibold">Read</th><th class="px-3 py-2 text-center font-semibold">Write</th><th class="px-3 py-2 text-center font-semibold">Execute</th></tr></thead><tbody><!--[-->`);
                  const each_array = ensure_array_like(legendRows);
                  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                    let row = each_array[$$index];
                    const r = iconCell(row.perms.read);
                    const w = iconCell(row.perms.write);
                    const x = iconCell(row.perms.execute);
                    const ReadIcon = r.Icon;
                    const WriteIcon = w.Icon;
                    const ExecIcon = x.Icon;
                    $$renderer5.push(`<tr><td${attr_class(clsx(cn("px-3 py-2 text-left font-medium border-l-4", row.ui.labelCell, row.ui.labelText)))}>${escape_html(row.label)}</td><td class="px-3 py-2 text-center"><!---->`);
                    ReadIcon($$renderer5, { class: cn("inline-block size-4", r.class) });
                    $$renderer5.push(`<!----></td><td class="px-3 py-2 text-center"><!---->`);
                    WriteIcon($$renderer5, { class: cn("inline-block size-4", w.class) });
                    $$renderer5.push(`<!----></td><td class="px-3 py-2 text-center"><!---->`);
                    ExecIcon($$renderer5, { class: cn("inline-block size-4", x.class) });
                    $$renderer5.push(`<!----></td></tr>`);
                  }
                  $$renderer5.push(`<!--]--></tbody></table> <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"><span>r=4, w=2, x=1</span> <span class="rounded bg-slate-200 px-2 py-0.5 font-mono font-semibold text-slate-700">chmod ${escape_html(parsed.octal)}</span></div>`);
                },
                $$slots: { default: true }
              });
              $$renderer4.push(`<!---->`);
            } else {
              $$renderer4.push("<!--[!-->");
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!---->`);
      }
    });
    $$renderer2.push(`<!---->`);
  });
}
function Advanced_vm_info_bundle_contents($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { contents } = $$props;
    function trimHeaderToPvmRoot(text) {
      const lines = text.split("\n");
      const firstPvmLineIndex = lines.findIndex((l) => l.includes(".pvm"));
      if (firstPvmLineIndex < 0) return text;
      const kept = lines.slice(firstPvmLineIndex);
      const nonEmpty = kept.filter((l) => l.trim().length > 0);
      const minIndent = nonEmpty.reduce(
        (acc, l) => {
          const indent = l.match(/^\s*/)?.[0]?.length ?? 0;
          return Math.min(acc, indent);
        },
        Number.POSITIVE_INFINITY
      );
      return kept.map((l) => l.slice(minIndent)).join("\n").trimEnd();
    }
    function parseHeaderBlock(lines, startIndex) {
      const collected = [];
      let i = startIndex;
      for (; i < lines.length; i++) {
        const line = lines[i];
        collected.push(line);
        if (line.includes("**:")) break;
      }
      const text = collected.join("\n").replace(/\*\*/g, "").replace(/^\n+/, "").replace(/:\s*$/, ":").trimEnd();
      return { text: trimHeaderToPvmRoot(text), endIndex: i };
    }
    function parseHeaderName(headerText) {
      const lines = headerText.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return void 0;
      const last = lines[lines.length - 1].replace(/:\s*$/, "");
      const cleaned = last.replace(/^[\s│├└─]+/, "").trim();
      return cleaned || void 0;
    }
    function parseEntryLine(line) {
      const re = /^(?<size>.+?)\s+\*\*(?<name>.+?)\*\*\s+_(?<meta>.+)_\s*$/;
      const match = re.exec(line);
      if (!match?.groups) return null;
      const size2 = match.groups.size.trim();
      const name = match.groups.name.trim();
      const rawMeta = match.groups.meta.trim();
      const metaTokens = rawMeta.split(/\s+/);
      const permissions = metaTokens[0];
      const owner = metaTokens.length > 1 ? metaTokens[1] : void 0;
      const modified = metaTokens.length > 2 ? metaTokens.slice(2).join(" ") : void 0;
      return {
        kind: "entry",
        size: size2,
        name,
        permissions,
        owner,
        modified,
        rawMeta,
        isDirectory: permissions.trim().startsWith("d")
      };
    }
    function parseSections(input) {
      const value = input?.trimEnd() ?? "";
      if (!value) return [];
      const rawLines = value.split("\n");
      const sections2 = [{ kind: "root", headerText: "Root files", entries: [] }];
      let current = sections2[0];
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (!line.trim()) continue;
        if (line.trim() === "**") {
          const header = parseHeaderBlock(rawLines, i);
          const headerName = parseHeaderName(header.text);
          current = {
            kind: "folder",
            headerText: header.text,
            headerName,
            entries: []
          };
          sections2.push(current);
          i = header.endIndex;
          continue;
        }
        const entry = parseEntryLine(line);
        if (entry) {
          current.entries.push(entry);
          continue;
        }
      }
      return sections2;
    }
    function arrangeSections(sections2) {
      if (sections2.length <= 1) return sections2;
      const root = sections2[0];
      const rest = sections2.slice(1);
      const harddisk = rest.filter((s) => s.headerName?.toLowerCase() === "harddisk.hdd");
      const snapshots = rest.filter((s) => s.headerName?.toLowerCase() === "snapshots");
      const other = rest.filter((s) => !harddisk.includes(s) && !snapshots.includes(s));
      return [root, ...harddisk, ...snapshots, ...other];
    }
    function pruneDirectories(section) {
      return {
        ...section,
        entries: section.entries.filter((e) => !e.isDirectory)
      };
    }
    let sections = arrangeSections(parseSections(contents)).map(pruneDirectories).filter((s) => s.kind === "root" || s.entries.length > 0);
    $$renderer2.push(`<div class="rounded-md border border-border bg-background p-2">`);
    if (sections.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-2 text-xs text-muted-foreground">No bundle listing.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="grid grid-cols-[max-content_minmax(0,1fr)_max-content_max-content_max-content] items-baseline gap-x-2 gap-y-0.5"><div class="col-span-5 mb-2 grid grid-cols-subgrid items-center gap-2 border-b border-border/60 pb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50"><span class="justify-self-end font-mono normal-case">Size</span> <span>Name</span> <span>Permissions</span> <span>Owner</span> <span>Modified</span></div> <!--[-->`);
      const each_array = ensure_array_like(sections);
      for (let sectionIndex = 0, $$length = each_array.length; sectionIndex < $$length; sectionIndex++) {
        let section = each_array[sectionIndex];
        if (section.kind === "root") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="col-span-5 mt-1 text-[11px] font-semibold text-foreground/70">${escape_html(section.headerText)}</div> `);
          if (section.entries.length === 0) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="col-span-5 text-xs text-muted-foreground">No files.</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<pre class="col-span-5 my-2 whitespace-pre font-mono text-[11px] font-semibold text-foreground/70">${escape_html(section.headerText)}</pre>`);
        }
        $$renderer2.push(`<!--]--> <!--[-->`);
        const each_array_1 = ensure_array_like(section.entries);
        for (let entryIndex = 0, $$length2 = each_array_1.length; entryIndex < $$length2; entryIndex++) {
          let entry = each_array_1[entryIndex];
          $$renderer2.push(`<span class="justify-self-end whitespace-nowrap font-mono text-[11px] text-foreground/80">${escape_html(entry.size)}</span> <span class="min-w-0 break-all font-semibold text-foreground">${escape_html(entry.name)}</span> <span class="whitespace-nowrap font-mono text-[11px] text-foreground/50">`);
          if (entry.permissions) {
            $$renderer2.push("<!--[-->");
            Unix_permissions($$renderer2, {
              permissions: entry.permissions,
              variant: "subtle",
              class: "text-foreground/50 hover:text-foreground/70"
            });
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`—`);
          }
          $$renderer2.push(`<!--]--></span> <span${attr_class(clsx(cn("whitespace-nowrap font-mono text-[11px] text-foreground/50", !entry.owner && "opacity-0")))}>${escape_html(entry.owner ?? "—")}</span> <span${attr_class(clsx(cn("whitespace-nowrap font-mono text-[11px] text-foreground/50", !entry.modified && "opacity-0")))}>${escape_html(entry.modified ?? "—")}</span>`);
        }
        $$renderer2.push(`<!--]--> `);
        if (sectionIndex < sections.length - 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="col-span-5 h-3"></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Advanced_vm_info_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    let tree = summary.pvmBundleTree;
    function countNodes(root) {
      let files = 0;
      let folders = 0;
      const stack = [root];
      while (stack.length) {
        const node = stack.pop();
        folders += 1;
        for (const child of node.children) {
          if (child.kind === "file") files += 1;
          else stack.push(child);
        }
      }
      return { files, folders };
    }
    let stats = tree ? countNodes(tree) : null;
    $$renderer2.push(`<div class="rv-section-block"><div class="rv-section-heading">PVM Bundle Location</div> `);
    if (tree?.path) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">Path</div> <div class="rv-row-value">`);
      Copy_button($$renderer2, {
        text: tree.path,
        size: "sm",
        variant: "ghost",
        class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(tree.path)}`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">Status</div> <div class="rv-row-value">No PVM bundle file list data</div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rv-section-block"><div class="rv-section-heading">Snapshots</div> `);
    if (summary.snapshots.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">Status</div> <div class="rv-row-value">No snapshots</div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(summary.snapshots);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let snap = each_array[i];
        $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">${escape_html(snap.name || `Snapshot ${i + 1}`)}</div> <div class="rv-row-value"><span class="font-mono text-[11px] text-muted-foreground">${escape_html(snap.dateTime)}</span></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rv-section-block"><div class="rv-section-heading">PVM Bundle Listing</div> `);
    if (stats) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mb-2 text-[11px] text-muted-foreground">${escape_html(stats.folders)} folders, ${escape_html(stats.files)} files</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    Advanced_vm_info_bundle_contents($$renderer2, { contents: summary.pvmBundleContents });
    $$renderer2.push(`<!----></div>`);
  });
}
function cpuColor(v) {
  if (v >= 30) return "#EF4444";
  if (v >= 10) return "#F59E0B";
  if (v >= 1) return "#3B82F6";
  return "#94A3B8";
}
function memColor(v) {
  if (v >= 4) return "#EF4444";
  if (v >= 2) return "#F59E0B";
  if (v >= 0.5) return "#3B82F6";
  return "#94A3B8";
}
function typeLabel(t) {
  switch (t) {
    case "parallels-tools":
      return "Parallels Tools";
    case "windows-store-app":
      return "Windows App";
    case "microsoft-component":
      return "Microsoft";
    case "third-party-app":
      return "Third‑party App";
    case "macos-app":
      return "macOS App";
    case "system":
      return "System";
    case "service":
      return "Service";
    default:
      return "Other";
  }
}
function typeBadgeClasses(t) {
  switch (t) {
    case "parallels-tools":
      return "border-cyan-200 bg-cyan-50 text-cyan-800";
    case "windows-store-app":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "microsoft-component":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "third-party-app":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "macos-app":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "system":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "service":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-border bg-muted/20 text-muted-foreground";
  }
}
function typeCounts(items) {
  const c = {
    all: items.length,
    "parallels-tools": 0,
    "windows-store-app": 0,
    "microsoft-component": 0,
    "macos-app": 0,
    "third-party-app": 0,
    system: 0,
    service: 0,
    other: 0
  };
  for (const it of items) {
    c[it.type] = (c[it.type] || 0) + 1;
  }
  return c;
}
function sortItems(items, key, dir) {
  const list = [...items];
  list.sort((a, b) => {
    const mul = -1;
    return (a.cpu - b.cpu) * mul;
  });
  return list;
}
function All_processes_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary, title = "Processes" } = $$props;
    let sortKey = "cpu";
    let filter = "all";
    let expandedPid = null;
    const items = summary.items ?? [];
    const maxCpu = Math.max(...items.map((p) => p.cpu), 1);
    const maxMem = Math.max(...items.map((p) => p.mem), 1);
    const counts = typeCounts(items);
    const filterOrder = [
      "parallels-tools",
      "windows-store-app",
      "microsoft-component",
      "third-party-app",
      "macos-app",
      "system",
      "service",
      "other"
    ];
    const visibleFilters = ["all", ...filterOrder.filter((t) => (counts[t] ?? 0) > 0)].map((key) => ({
      key,
      label: key === "all" ? "All" : key === "parallels-tools" ? "Parallels Tools" : key === "windows-store-app" ? "Windows Apps" : key === "microsoft-component" ? "Microsoft" : key === "third-party-app" ? "Third‑party Apps" : key === "macos-app" ? "macOS Apps" : key === "system" ? "System" : key === "service" ? "Services" : "Other"
    }));
    const filtered = sortItems(items);
    const displayed = filtered.slice(0, 10);
    function sortGlyph(active, dir) {
      if (!active) return "⇅";
      return "↓";
    }
    function microPct(value, max) {
      if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
      return Math.max(0, Math.min(100, value / max * 100));
    }
    function isDimUser(u) {
      return u === "root" || u.startsWith("_");
    }
    $$renderer2.push(`<div class="space-y-3"><div><div class="text-[13px] font-semibold text-foreground">${escape_html(title)}</div> <div class="mt-0.5 text-[12px] text-muted-foreground">${escape_html(items.length)} processes · sorted by ${escape_html(sortKey.toUpperCase())} ${escape_html("↓")}</div></div> <div class="flex flex-wrap gap-2"><!--[-->`);
    const each_array = ensure_array_like(visibleFilters);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let f = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class(`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${filter === f.key ? "border border-blue-400 bg-blue-50 text-blue-700" : "border border-border bg-background text-muted-foreground hover:bg-muted/30"}`)}>${escape_html(f.label)} <span${attr_class(`ml-0.5 rounded-full px-1.5 text-[10px] font-semibold ${filter === f.key ? "bg-blue-100 text-blue-700" : "bg-muted/40 text-muted-foreground"}`)}>${escape_html(counts[f.key] ?? 0)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="overflow-hidden rounded-xl border border-border bg-background"><div class="grid grid-cols-[1fr_120px_120px_90px] border-b border-border bg-muted/20"><button type="button"${attr_class(`flex items-center px-3 py-2 text-[10.5px] font-bold uppercase tracking-wider ${"text-muted-foreground"}`)}>Process <span class="ml-1 text-[10px]">${escape_html(sortGlyph(sortKey === "name"))}</span></button> <button type="button"${attr_class(`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${"text-blue-600"}`)}>CPU <span class="ml-1 text-[10px]">${escape_html(sortGlyph(sortKey === "cpu"))}</span></button> <button type="button"${attr_class(`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${"text-muted-foreground"}`)}>Memory <span class="ml-1 text-[10px]">${escape_html(sortGlyph(sortKey === "mem"))}</span></button> <button type="button"${attr_class(`flex items-center px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider ${"text-muted-foreground"}`)}>User <span class="ml-1 text-[10px]">${escape_html(sortGlyph(sortKey === "user"))}</span></button></div> `);
    if (displayed.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="p-4 text-[12px] text-muted-foreground">No processes match the current filter.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(displayed);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let proc = each_array_1[$$index_1];
        const expanded = expandedPid === proc.pid;
        $$renderer2.push(`<div class="border-b border-border/40 last:border-b-0"><div${attr_class(`grid grid-cols-[1fr_120px_120px_90px] cursor-pointer transition-colors ${expanded ? "bg-muted/20" : "hover:bg-muted/10"}`)} role="button" tabindex="0"><div class="flex items-center gap-2 px-3 py-2 min-w-0">`);
        Badge($$renderer2, {
          variant: "outline",
          class: `text-[10px] uppercase tracking-wide ${typeBadgeClasses(proc.type)}`,
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(typeLabel(proc.type))}`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----> <span${attr_class(`min-w-0 truncate text-[13px] ${proc.isHelper ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}`)}${attr("title", proc.command)}>${escape_html(proc.isHelper ? `↳ ${proc.shortName}` : proc.shortName)}</span></div> <div class="flex items-center gap-2 px-2 py-2"><div class="h-1.5 w-[60px] overflow-hidden rounded bg-muted/50"><div class="h-full rounded"${attr_style("", {
          width: `${microPct(proc.cpu, maxCpu)}%`,
          background: cpuColor(proc.cpu)
        })}></div></div> <span class="min-w-[42px] text-right font-mono text-[12px] font-semibold"${attr_style("", { color: cpuColor(proc.cpu) })}>${escape_html(proc.cpu.toFixed(1))}%</span></div> <div class="flex items-center gap-2 px-2 py-2"><div class="h-1.5 w-[60px] overflow-hidden rounded bg-muted/50"><div class="h-full rounded"${attr_style("", {
          width: `${microPct(proc.mem, maxMem)}%`,
          background: memColor(proc.mem)
        })}></div></div> <span class="min-w-[42px] text-right font-mono text-[12px] font-semibold"${attr_style("", { color: memColor(proc.mem) })}>${escape_html(proc.mem.toFixed(1))}%</span></div> <div class="px-2 py-2"><span${attr_class(`font-mono text-[11px] font-medium ${isDimUser(proc.user) ? "text-muted-foreground" : "text-slate-700"}`)}>${escape_html(proc.user)}</span></div></div> `);
        if (expanded) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="bg-muted/10 px-3 py-3 text-[11.5px] font-mono text-muted-foreground"><div class="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1"><span class="text-muted-foreground/70">PID</span> <span class="text-foreground/80">${escape_html(proc.pid)}</span> <span class="text-muted-foreground/70">Type</span> <span class="text-foreground/80">${escape_html(typeLabel(proc.type))}</span> <span class="text-muted-foreground/70">User</span> <span class="text-foreground/80">${escape_html(proc.user)}</span> <span class="text-muted-foreground/70">Path</span> <div class="min-w-0">`);
          Copy_button($$renderer2, {
            text: proc.command,
            size: "sm",
            variant: "ghost",
            class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->${escape_html(proc.command)}`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!----></div></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (filtered.length > 10) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="border-t border-border/40 p-3 text-center"><button type="button" class="rounded-md border border-border px-4 py-1.5 text-[12px] text-muted-foreground hover:bg-muted/30">${escape_html(`Show all ${filtered.length} processes`)}</button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function adapterRole(adapter) {
  const desc = (adapter.description || "").toLowerCase();
  if (desc.includes("fortinet") || desc.includes("vpn")) return "vpn";
  if (desc.includes("parallels") || desc.includes("virtio") || desc.includes("prl")) return "primary";
  return "other";
}
function roleLabel$1(role) {
  if (role === "vpn") return "VPN";
  if (role === "primary") return "PRIMARY";
  return "ADAPTER";
}
function roleBadgeClasses(role) {
  if (role === "vpn") return "border-amber-200 bg-amber-50 text-amber-700";
  if (role === "primary") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-border bg-muted/20 text-muted-foreground";
}
function driveStatusColor(status) {
  if (status === "OK" || !status) return "bg-emerald-500";
  if (status === "Disconnected" || status === "Unavailable") return "bg-rose-500";
  if (status === "Reconnecting") return "bg-amber-500";
  return "bg-slate-300";
}
function driveStatusBadge(status, raw) {
  const s = status ?? "Other";
  if (s === "OK") return { label: "OK", classes: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (s === "Disconnected") return { label: "Disconnected", classes: "border-rose-200 bg-rose-50 text-rose-700" };
  if (s === "Unavailable") return { label: "Unavailable", classes: "border-rose-200 bg-rose-50 text-rose-700" };
  if (s === "Reconnecting") return { label: "Reconnecting", classes: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: raw || "Other", classes: "border-border bg-muted/20 text-muted-foreground" };
}
function Guest_adapter_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { adapter } = $$props;
    let open = false;
    const role = adapterRole(adapter);
    const hasIp = Boolean(adapter.ip);
    const dotClass = hasIp ? "bg-emerald-500" : "bg-slate-300";
    const dhcpText = adapter.dhcpEnabled === void 0 ? "Unknown" : adapter.dhcpEnabled ? "✓ Enabled" : "✗ Disabled";
    const dnsList = adapter.dns ?? [];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> <span${attr_class(`size-2 rounded-full ${dotClass}`)}></span> <span${attr_class(`text-[13px] font-semibold ${hasIp ? "text-foreground" : "text-muted-foreground"}`)}>${escape_html(adapter.name ?? "Adapter")}</span> `);
              Badge($$renderer5, {
                variant: "outline",
                class: `text-[10px] ${roleBadgeClasses(role)}`,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(roleLabel$1(role))}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="ml-auto font-mono text-[12px]">`);
              if (adapter.ip) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-slate-700">${escape_html(adapter.ip)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
                $$renderer5.push(`<span class="text-muted-foreground">No IP</span>`);
              }
              $$renderer5.push(`<!--]--></span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">Driver</span> <span class="font-mono text-foreground/80">${escape_html(adapter.description ?? "—")}</span> `);
              if (adapter.ip) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">IPv4</span> <span class="font-mono text-foreground/80">${escape_html(adapter.ip)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (adapter.ipv6) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">IPv6</span> <span class="font-mono text-foreground/80 break-all">${escape_html(adapter.ipv6)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (adapter.gateway) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">Gateway</span> <span class="font-mono text-foreground/80">${escape_html(adapter.gateway)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> <span class="text-muted-foreground/80 font-medium">DHCP</span> <span class="font-mono text-foreground/80">${escape_html(dhcpText)}</span> `);
              if (dnsList.length > 0) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">DNS</span> <div class="flex flex-wrap gap-1.5"><!--[-->`);
                const each_array = ensure_array_like(dnsList);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let d = each_array[$$index];
                  $$renderer5.push(`<span class="rounded border border-border bg-muted/20 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">${escape_html(d)}</span>`);
                }
                $$renderer5.push(`<!--]--></div>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Guest_drive_row($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { drive } = $$props;
    const dot = driveStatusColor(drive.status);
    const badge = driveStatusBadge(drive.status, drive.statusRaw);
    const letter = drive.letter ? `${drive.letter}:` : "—";
    $$renderer2.push(`<div class="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0 text-[13px]"><span${attr_class(`size-2 rounded-full ${dot}`)}></span> <span class="w-9 font-mono text-[13px] font-bold text-foreground">${escape_html(letter)}</span> <span class="text-muted-foreground">→</span> <div class="min-w-0 flex-1">`);
    if (drive.remotePath) {
      $$renderer2.push("<!--[-->");
      Copy_button($$renderer2, {
        text: drive.remotePath,
        size: "sm",
        variant: "ghost",
        class: "h-auto min-h-6 px-2 font-mono text-[12px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(drive.remotePath)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="font-mono text-[12px] text-muted-foreground">—</span>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (drive.provider) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-0.5 text-[11px] text-muted-foreground/80">${escape_html(drive.provider)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    Badge($$renderer2, {
      variant: "outline",
      class: `shrink-0 text-[10px] ${badge.classes}`,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(badge.label)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
  });
}
function classifyWindowsGuestProcessType(path) {
  const p = path.toLowerCase();
  if (p.includes("\\program files\\parallels\\parallels tools\\") || p.includes("\\program files (x86)\\parallels\\parallels tools\\")) {
    return "parallels-tools";
  }
  if (p.startsWith("c:\\windows\\") || p.includes("\\windows\\system32\\") || p.includes("\\windows\\syswow64\\")) {
    return "system";
  }
  const programFilesMicrosoftFolder = /^c:\\program files(?: \(x86\))?\\[^\\]*microsoft[^\\]*\\/;
  if (programFilesMicrosoftFolder.test(p) || p.startsWith("c:\\program files\\microsoft\\") || p.startsWith("c:\\program files (x86)\\microsoft\\") || p.includes("\\microsoft\\edgewebview\\") || p.includes("\\microsoft visual studio\\") || p.includes("\\programdata\\microsoft\\") || p.includes("\\common files\\microsoft shared\\")) {
    return "microsoft-component";
  }
  if (p.startsWith("c:\\program files\\") || p.startsWith("c:\\program files (x86)\\") || p.startsWith("c:\\users\\") || p.startsWith("c:\\programdata\\")) {
    return "third-party-app";
  }
  return "other";
}
function windowsProcessShortName(path) {
  const parts = path.split(/\\+/);
  const last = parts[parts.length - 1] || path;
  return last.replace(/\.exe$/i, "");
}
function Guest_commands_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    const system = summary.system;
    const adapters = summary.network?.adapters ?? [];
    const drives = summary.network?.drives ?? [];
    let guestProcessItems = (() => {
      const procs = summary.processes ?? [];
      const totalsMem = summary.totals?.memoryKb;
      const maxMemKb = Math.max(...procs.map((p) => p.memoryKb ?? 0), 1);
      return procs.filter((p) => p.pid !== void 0).map((p) => {
        const command = p.path ?? "(unknown)";
        const type = p.path ? classifyWindowsGuestProcessType(p.path) : "other";
        const shortName = p.path ? windowsProcessShortName(p.path) : `pid ${p.pid}`;
        const cpu = p.cpuPercent ?? 0;
        const memKb = p.memoryKb ?? 0;
        const mem = totalsMem && totalsMem > 0 ? memKb / totalsMem * 100 : memKb / maxMemKb * 100;
        return {
          user: p.user ?? "unknown",
          pid: String(p.pid),
          cpu,
          mem,
          command,
          type,
          appName: void 0,
          isHelper: false,
          shortName,
          displayName: shortName
        };
      });
    })();
    $$renderer2.push(`<div class="space-y-5"><div class="rounded-xl border border-border bg-background px-4 py-3"><div class="flex items-center gap-2"><div class="text-[13px] font-semibold text-foreground">${escape_html(system?.hostname ?? "Guest VM")}</div> `);
    if (system?.architecture) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(system.architecture)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (system?.processorCount) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(system.processorCount)} vCPU`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (summary.isEmpty) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-1 text-[11px] font-mono text-muted-foreground">GuestCommands: empty</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div><div class="mb-2 flex items-center gap-2"><div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Network Adapters</div> `);
    Badge($$renderer2, {
      variant: "outline",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(adapters.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <div class="h-px flex-1 bg-border/70"></div></div> `);
    if (adapters.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No adapters parsed.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(adapters);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let adapter = each_array[idx];
        Guest_adapter_card($$renderer2, { adapter });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div><div class="mb-2 flex items-center gap-2"><div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Mapped Drives</div> `);
    Badge($$renderer2, {
      variant: "outline",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(drives.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <div class="h-px flex-1 bg-border/70"></div></div> <div class="rounded-xl border border-border bg-background px-4 py-1">`);
    if (drives.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="py-3 text-[12px] text-muted-foreground">No network drives.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(drives);
      for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
        let drive = each_array_1[idx];
        Guest_drive_row($$renderer2, { drive });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div><div class="mb-2 flex items-center gap-2"><div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Guest Processes</div> `);
    Badge($$renderer2, {
      variant: "outline",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(guestProcessItems.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <div class="h-px flex-1 bg-border/70"></div></div> `);
    if (guestProcessItems.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No guest processes parsed.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      All_processes_view($$renderer2, {
        summary: { items: guestProcessItems },
        title: "Guest Processes"
      });
      $$renderer2.push(`<!----> `);
      if (summary.totals?.cpuPercent !== void 0 || summary.totals?.memoryKb !== void 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-2 text-[11px] font-mono text-muted-foreground">TOTAL: ${escape_html(summary.totals?.cpuPercent ?? "?")}% CPU · ${escape_html(summary.totals?.memoryKb ?? "?")} KB (for mem normalization)</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function fmtBytes(bytes) {
  if (bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i >= 3 ? 2 : 0)} ${units[i]}`;
}
function fmtMb(mb) {
  if (mb === null) return "—";
  if (mb >= 1024) return `${Math.round(mb / 1024)} GB`;
  return `${mb} MB`;
}
function usbSpeedLabel(speed) {
  switch (speed) {
    case "low":
      return "1.5 Mbps";
    case "full":
      return "12 Mbps";
    case "high":
      return "480 Mbps";
    case "super":
      return "5 Gbps";
    default:
      return speed;
  }
}
function usbSpeedVariant(speed) {
  switch (speed) {
    case "super":
      return "secondary";
    case "high":
      return "default";
    case "full":
      return "outline";
    case "low":
    case "unknown":
    default:
      return "muted";
  }
}
function transportVariant(transport) {
  switch (transport) {
    case "USB":
      return "outline";
    case "Bluetooth":
    case "Bluetooth Low Energy":
      return "secondary";
    case "FIFO":
    case "SPI":
    case "unknown":
    default:
      return "muted";
  }
}
function audioVariant(type) {
  switch (type) {
    case "builtin":
      return "outline";
    case "bluetooth":
      return "secondary";
    case "virtual":
      return "default";
    case "usb":
      return "secondary";
    case "continuity":
      return "secondary";
    case "monitor":
      return "outline";
    case "mute":
      return "muted";
    default:
      return "muted";
  }
}
function roleLabel(role) {
  switch (role) {
    case "combo":
      return "KB+Mouse";
    case "keyboard":
      return "Keyboard";
    case "mouse":
      return "Mouse";
    case "gamepad":
      return "Gamepad";
    default:
      return "Unknown";
  }
}
function Host_info_audio_section($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { audio } = $$props;
    function iconFor(type) {
      switch (type) {
        case "monitor":
          return Monitor;
        case "bluetooth":
          return Headphones;
        case "virtual":
          return Message_circle;
        case "usb":
          return Mic;
        case "continuity":
          return Smartphone;
        case "mute":
          return Volume_x;
        case "builtin":
        case "other":
        default:
          return Volume_2;
      }
    }
    $$renderer2.push(`<div class="space-y-2"><div class="flex items-center gap-2"><div class="text-[13px] font-semibold text-foreground">Audio</div> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(audio.outputs.length)} out`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(audio.inputs.length)} in`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> <div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-3"><div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Output</div> `);
    if (audio.outputs.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-1 text-[12px] text-muted-foreground">No output devices.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="mt-2 space-y-1"><!--[-->`);
      const each_array = ensure_array_like(audio.outputs);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let d = each_array[idx];
        const Icon2 = iconFor(d.type);
        $$renderer2.push(`<div class="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2"><!---->`);
        Icon2($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">${escape_html(d.name)}</span> `);
        Badge($$renderer2, {
          variant: audioVariant(d.type),
          class: "text-[10px]",
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(d.type)}`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="mt-4 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Input</div> `);
    if (audio.inputs.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-1 text-[12px] text-muted-foreground">No input devices.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="mt-2 space-y-1"><!--[-->`);
      const each_array_1 = ensure_array_like(audio.inputs);
      for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
        let d = each_array_1[idx];
        const Icon2 = iconFor(d.type);
        $$renderer2.push(`<div class="flex items-center gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2"><!---->`);
        Icon2($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">${escape_html(d.name)}</span> `);
        Badge($$renderer2, {
          variant: audioVariant(d.type),
          class: "text-[10px]",
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(d.type)}`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function Host_info_disk_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { disk } = $$props;
    let open = false;
    const partitions = disk.partitions ?? [];
    const sizeLabel = disk.sizeFormatted ?? fmtBytes(disk.sizeBytes);
    const isExternal = disk.external === true;
    const isVirtual = disk.isVirtualDisk === true;
    const parentStore = disk.parentStore;
    const schemeTitle = () => {
      switch (disk.partitionScheme) {
        case "GPT":
          return "GPT (GUID Partition Table)";
        case "MBR":
          return "MBR (Master Boot Record)";
        case "APFS":
          return "APFS container / synthesized disk";
        default:
          return "Partition scheme";
      }
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> `);
              Hard_drive($$renderer5, { class: "size-4 text-muted-foreground" });
              $$renderer5.push(`<!----> <span class="text-[13px] font-semibold text-foreground truncate">${escape_html(disk.name)}</span> `);
              Badge($$renderer5, {
                variant: "outline",
                class: "text-[10px]",
                title: schemeTitle,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(disk.partitionScheme)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              if (isExternal) {
                $$renderer5.push("<!--[-->");
                Badge($$renderer5, {
                  variant: "default",
                  class: "text-[10px]",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->External`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (isVirtual) {
                $$renderer5.push("<!--[-->");
                Badge($$renderer5, {
                  variant: "secondary",
                  class: "text-[10px]",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->Container`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> <span class="ml-auto font-mono text-[12px] text-foreground/80">${escape_html(sizeLabel)}</span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3 space-y-2",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">Identifier</span> <span class="font-mono text-foreground/80">${escape_html(disk.identifier || "—")}</span> `);
              if (parentStore) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">Backed by</span> <span class="font-mono text-foreground/80">/dev/${escape_html(parentStore)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (disk.logicalSectorSize !== null) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">Sector size</span> <span class="font-mono text-foreground/80">${escape_html(disk.logicalSectorSize)} bytes</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (disk.removable !== null) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">Removable</span> <span class="font-mono text-foreground/80">${escape_html(disk.removable ? "Yes" : "No")}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></div> `);
              if (partitions.length > 0) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<div class="pt-1"><div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Partitions (${escape_html(partitions.length)})</div> <div class="mt-2 space-y-1"><!--[-->`);
                const each_array = ensure_array_like(partitions);
                for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
                  let p = each_array[idx];
                  $$renderer5.push(`<div class="flex items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2"><span class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><span class="font-mono text-[11px] text-muted-foreground">${escape_html(p.systemName ? p.systemName.split("../../ui/").pop() : "—")}</span> <span class="text-[12px] font-medium text-foreground">${escape_html(p.name)}</span> `);
                  if (p.typeName) {
                    $$renderer5.push("<!--[-->");
                    Badge($$renderer5, {
                      variant: "muted",
                      class: "text-[10px]",
                      children: ($$renderer6) => {
                        $$renderer6.push(`<!---->${escape_html(p.typeName)}`);
                      },
                      $$slots: { default: true }
                    });
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]--></div> `);
                  if (p.gptType) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.push(`<div class="mt-0.5 font-mono text-[10px] text-muted-foreground break-all">${escape_html(p.gptType)}</div>`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]--></span> <span class="ml-auto flex flex-col items-end gap-0.5"><span class="font-mono text-[11px] text-foreground/80">${escape_html(fmtBytes(p.sizeBytes))}</span> `);
                  if (p.freeSizeBytes !== null && p.freeSizeBytes >= 0) {
                    $$renderer5.push("<!--[-->");
                    $$renderer5.push(`<span class="font-mono text-[10px] text-muted-foreground">${escape_html(fmtBytes(p.freeSizeBytes))} free</span>`);
                  } else {
                    $$renderer5.push("<!--[!-->");
                  }
                  $$renderer5.push(`<!--]--></span></div>`);
                }
                $$renderer5.push(`<!--]--></div></div>`);
              } else {
                $$renderer5.push("<!--[!-->");
                $$renderer5.push(`<div class="text-[12px] text-muted-foreground">No partition data.</div>`);
              }
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Host_info_flags_summary($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { flags, hasDisplayLink } = $$props;
    const items = (() => {
      const out = [];
      if (flags.lowMemory) out.push({
        key: "lowMemory",
        tone: "warn",
        text: "High memory usage (active+wired)",
        Icon: Triangle_alert
      });
      if (flags.privacyRestricted) out.push({
        key: "privacy",
        tone: "warn",
        text: "Privacy restrictions may block devices",
        Icon: Shield_alert
      });
      if (hasDisplayLink) out.push({
        key: "displaylink",
        tone: "warn",
        text: "DisplayLink detected",
        Icon: Monitor
      });
      if (flags.hasExternalDisks) out.push({
        key: "external",
        tone: "info",
        text: "External disk connected",
        Icon: Hard_drive
      });
      if (flags.hasUsbCamera) out.push({
        key: "camera",
        tone: "info",
        text: "USB camera present",
        Icon: Camera
      });
      if (flags.hasBluetoothAudio) out.push({
        key: "btaudio",
        tone: "info",
        text: "Bluetooth audio present",
        Icon: Headphones
      });
      return out;
    })();
    function toneClass(tone) {
      if (tone === "danger") return "border-red-200 bg-red-50/60 text-red-800";
      if (tone === "warn") return "border-amber-200 bg-amber-50/60 text-amber-800";
      return "border-sky-200 bg-sky-50/60 text-sky-800";
    }
    if (items.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(items);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$renderer2.push(`<div${attr_class(`flex items-center gap-2 rounded-xl border px-3 py-2 text-[12px] ${toneClass(item.tone)}`)}><!---->`);
        item.Icon($$renderer2, { class: "size-4" });
        $$renderer2.push(`<!----> <span class="font-medium">${escape_html(item.text)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Host_info_input_device_row($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { device } = $$props;
    function iconFor(role) {
      switch (role) {
        case "keyboard":
          return Keyboard;
        case "mouse":
          return Mouse;
        case "combo":
          return Sliders_horizontal;
        case "gamepad":
          return Gamepad_2;
        default:
          return Sliders_horizontal;
      }
    }
    const RoleIcon = iconFor(device.role);
    const roleTitle = (() => {
      switch (device.role) {
        case "combo":
          return "Reports both keyboard and mouse functions";
        case "keyboard":
          return "Keyboard-like HID device";
        case "mouse":
          return "Mouse/pointing HID device";
        case "gamepad":
          return "Game controller HID device";
        default:
          return "HID device role";
      }
    })();
    const transportTitle = (() => {
      switch (device.transport) {
        case "FIFO":
          return "FIFO: internal macOS transport (built-in device path)";
        case "SPI":
          return "SPI: internal bus (often built-in keyboards/trackpads)";
        case "USB":
          return "USB: physical USB device";
        case "Bluetooth":
          return "Bluetooth: wireless device";
        case "Bluetooth Low Energy":
          return "Bluetooth Low Energy: wireless device (BLE)";
        default:
          return "Transport (from HostInfo.xml)";
      }
    })();
    $$renderer2.push(`<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0"><!---->`);
    RoleIcon($$renderer2, { class: "size-4 text-muted-foreground" });
    $$renderer2.push(`<!----> <div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><span class="truncate text-[12px] font-medium text-foreground">${escape_html(device.name)}</span> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      title: roleTitle,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(roleLabel(device.role))}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Badge($$renderer2, {
      variant: transportVariant(device.transport),
      class: "text-[10px]",
      title: transportTitle,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(device.transport)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> <div class="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">`);
    if (device.vendorId !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span>VID ${escape_html(device.vendorId)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (device.productId !== null) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span>PID ${escape_html(device.productId)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (device.identifier) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="truncate">ID ${escape_html(device.identifier)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function Host_info_network_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { adapter } = $$props;
    let open = false;
    const isUp = adapter.enabled === true;
    const ipv4 = adapter.addresses.ipv4;
    const ipv4Subnet = adapter.addresses.ipv4Subnet;
    const ipv6 = adapter.addresses.ipv6;
    const ipv6Prefix = adapter.addresses.ipv6Prefix;
    const statusVariant = isUp ? "success" : "destructive";
    const statusText = isUp ? "Active" : "Down";
    const typeIcon = adapter.type === "wifi" ? Wifi : Cable;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              const Icon2 = typeIcon;
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> <!---->`);
              Icon2($$renderer5, { class: "size-4 text-muted-foreground" });
              $$renderer5.push(`<!----> <span class="text-[13px] font-semibold text-foreground truncate">${escape_html(adapter.name)}</span> `);
              Badge($$renderer5, {
                variant: statusVariant,
                class: "text-[10px]",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(statusText)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="ml-auto font-mono text-[12px]">`);
              if (ipv4) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-foreground/80">${escape_html(ipv4)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
                $$renderer5.push(`<span class="text-muted-foreground">No IPv4</span>`);
              }
              $$renderer5.push(`<!--]--></span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">MAC</span> <span class="font-mono text-foreground/80">${escape_html(adapter.mac ?? "—")}</span> `);
              if (ipv4) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">IPv4</span> <span class="font-mono text-foreground/80">${escape_html(ipv4)}${escape_html(ipv4Subnet ? `/${ipv4Subnet}` : "")}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> `);
              if (ipv6) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">IPv6</span> <span class="font-mono text-foreground/80 break-all">${escape_html(ipv6)}${escape_html(ipv6Prefix ? `/${ipv6Prefix}` : "")}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--> <span class="text-muted-foreground/80 font-medium">DHCP</span> <span class="font-mono text-foreground/80">${escape_html(adapter.dhcp === null ? "Unknown" : adapter.dhcp ? "Enabled" : "Static")}</span> <span class="text-muted-foreground/80 font-medium">Interface</span> <span class="font-mono text-foreground/80">${escape_html(adapter.identifier || "—")}</span> `);
              if (adapter.vlanTag !== null) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground/80 font-medium">VLAN</span> <span class="font-mono text-foreground/80">${escape_html(adapter.vlanTag)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Host_info_section_header($$renderer, $$props) {
  let { title, count = null, Icon: Icon2 = null } = $$props;
  $$renderer.push(`<div class="flex items-center gap-2 pt-2">`);
  if (Icon2) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<span class="text-muted-foreground"><!---->`);
    Icon2($$renderer, { class: "size-4" });
    $$renderer.push(`<!----></span>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> <div class="text-[13px] font-semibold text-foreground">${escape_html(title)}</div> `);
  if (count !== null) {
    $$renderer.push("<!--[-->");
    Badge($$renderer, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer2) => {
        $$renderer2.push(`<!---->${escape_html(count)}`);
      },
      $$slots: { default: true }
    });
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> <div class="ml-auto h-px flex-1 bg-border/60"></div></div>`);
}
function Host_info_system_banner($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { system } = $$props;
    const osLabel = system.os.displayString ?? (system.os.name && system.os.version ? `${system.os.name} ${system.os.version}` : null);
    const memory = system.memory;
    const live = memory.live;
    const hostRamMb = memory.hostRamMb;
    const activeWiredRatio = (() => {
      if (!live || !hostRamMb) return null;
      const active = live.activeMb ?? 0;
      const wired = live.wiredMb ?? 0;
      return (active + wired) / hostRamMb;
    })();
    const isLowMemory = (activeWiredRatio ?? 0) >= 0.85;
    const otherMb = (() => {
      if (!live || !hostRamMb) return null;
      const active = live.activeMb ?? 0;
      const wired = live.wiredMb ?? 0;
      const inactive = live.inactiveMb ?? 0;
      const free = live.freeMb ?? 0;
      const other = hostRamMb - active - wired - inactive - free;
      return other > 0 ? other : 0;
    })();
    const memSegments = (() => {
      if (!live || !hostRamMb) return [];
      return [
        { label: "Active", mb: live.activeMb, class: "bg-sky-500" },
        { label: "Wired", mb: live.wiredMb, class: "bg-indigo-500" },
        {
          label: "Inactive",
          mb: live.inactiveMb,
          class: "bg-slate-300"
        },
        {
          label: "Other",
          mb: otherMb ?? 0,
          class: "bg-slate-200",
          title: "Other = Host RAM - (active + wired + inactive + free). This often includes cached/compressed/other categories not exposed directly here."
        }
      ];
    })();
    const privacyRestricted = system.privacy.cameraAllowed === false || system.privacy.microphoneAllowed === false;
    const privacyText = () => {
      const parts = [];
      if (system.privacy.cameraAllowed === false) parts.push("Camera blocked");
      if (system.privacy.microphoneAllowed === false) parts.push("Microphone blocked");
      return parts.join(" · ");
    };
    $$renderer2.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><div class="flex flex-wrap items-center gap-2 px-4 py-3"><span class="text-muted-foreground">`);
    if (system.isNotebook) {
      $$renderer2.push("<!--[-->");
      Laptop($$renderer2, { class: "size-4" });
    } else {
      $$renderer2.push("<!--[!-->");
      Monitor($$renderer2, { class: "size-4" });
    }
    $$renderer2.push(`<!--]--></span> <div class="flex flex-wrap items-center gap-2"><span class="text-[13px] font-semibold text-foreground">${escape_html(system.cpu.model ?? "Host CPU")}</span> `);
    if (system.cpu.cores !== null) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(system.cpu.cores)} cores`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (memory.hostRamMb !== null) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(fmtMb(memory.hostRamMb))} RAM`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (osLabel) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "secondary",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(osLabel)}`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (system.cpu.hvtSupported === false) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "destructive",
        class: "text-[10px]",
        title: "Hardware virtualization flags from HostInfo.xml (HvtNptAvail/HvtUnrestrictedAvail)",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->No HW Virt`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (live && hostRamMb) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="px-4 pb-3"><div class="h-2 w-full overflow-hidden rounded-full border border-border bg-muted/30"><div class="flex h-full w-full"><!--[-->`);
      const each_array = ensure_array_like(memSegments);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let seg = each_array[$$index];
        $$renderer2.push(`<div${attr_class(clsx(seg.class))}${attr_style(`width: ${seg.mb / hostRamMb * 100}%;`)}${attr("title", seg.title ?? `${seg.label}: ${fmtMb(seg.mb)}`)}></div>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground"><div class="flex flex-wrap items-center gap-x-3 gap-y-1"><!--[-->`);
      const each_array_1 = ensure_array_like(memSegments);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let seg = each_array_1[$$index_1];
        if (seg.mb > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<span class="inline-flex items-center gap-1"${attr("title", seg.title ?? void 0)}><span${attr_class(`size-2 rounded-sm ${seg.class}`)}></span> <span class="font-mono">${escape_html(seg.label)} ${escape_html(fmtMb(seg.mb))}</span></span>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> <span class="font-mono"><span${attr_class(clsx(isLowMemory ? "text-destructive font-semibold" : "text-foreground/80"))}>${escape_html(fmtMb(live.freeMb))}</span> <span>free</span></span></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (system.hardwareUuid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="border-t border-border/50 bg-muted/10 px-4 py-2"><div class="flex items-center justify-between gap-2"><div class="text-[11px] text-muted-foreground">Hardware UUID</div> `);
      Copy_button($$renderer2, {
        text: system.hardwareUuid,
        size: "sm",
        variant: "ghost",
        class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-right",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(system.hardwareUuid)}`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (privacyRestricted) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="border-t border-amber-200/60 bg-amber-50/60 px-4 py-2"><div class="flex items-center gap-2 text-[12px] text-amber-800">`);
      Shield_alert($$renderer2, { class: "size-4" });
      $$renderer2.push(`<!----> <span class="font-medium">Privacy restricted</span> `);
      if (privacyText) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="text-amber-800/80">${escape_html(privacyText)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Host_info_usb_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { device } = $$props;
    let open = false;
    const speedText = usbSpeedLabel(device.speed);
    const speedVariant = usbSpeedVariant(device.speed);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> `);
              Usb($$renderer5, { class: "size-4 text-muted-foreground" });
              $$renderer5.push(`<!----> <span class="text-[13px] font-semibold text-foreground truncate">${escape_html(device.name)}</span> `);
              Badge($$renderer5, {
                variant: speedVariant,
                class: "text-[10px]",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(speedText)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              if (device.vfSupported === true) {
                $$renderer5.push("<!--[-->");
                Badge($$renderer5, {
                  variant: "success",
                  class: "text-[10px]",
                  title: "Supported by macOS Virtualization Framework (SupportedByVirtualizationFramework=1)",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->Apple VF`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$renderer5.push("<!--[!-->");
                if (device.vfSupported === false) {
                  $$renderer5.push("<!--[-->");
                  Badge($$renderer5, {
                    variant: "muted",
                    class: "text-[10px]",
                    title: "Not supported by macOS Virtualization Framework (SupportedByVirtualizationFramework=0)",
                    children: ($$renderer6) => {
                      $$renderer6.push(`<!---->No Apple VF`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$renderer5.push("<!--[!-->");
                }
                $$renderer5.push(`<!--]-->`);
              }
              $$renderer5.push(`<!--]--> `);
              if (device.state) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="ml-auto font-mono text-[12px] text-muted-foreground">${escape_html(device.state)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3 space-y-2",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">Vendor</span> <span class="font-mono text-foreground/80">${escape_html(device.vendorId ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">Product</span> <span class="font-mono text-foreground/80">${escape_html(device.productId ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">Location</span> <span class="font-mono text-foreground/80 break-all">${escape_html(device.location ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">Serial</span> <span class="font-mono text-foreground/80 break-all">${escape_html(device.serial ?? "—")}</span></div> `);
              if (device.rawUuid) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<div><div class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Raw UUID</div> `);
                Copy_button($$renderer5, {
                  text: device.rawUuid,
                  size: "sm",
                  variant: "ghost",
                  class: "mt-1 h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->${escape_html(device.rawUuid)}`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----></div>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Host_info_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    const disks = summary.hardDisks ?? [];
    const adapters = summary.networkAdapters ?? [];
    const usbDevices = summary.usbDevices ?? [];
    const inputDevices = summary.inputDevices ?? [];
    const bluetoothDevices = summary.bluetoothDevices ?? [];
    const printers = summary.printers ?? [];
    const cameras = summary.cameras ?? [];
    const smartCardReaders = summary.smartCardReaders ?? [];
    $$renderer2.push(`<div class="space-y-4">`);
    Host_info_flags_summary($$renderer2, { flags: summary.flags, hasDisplayLink: summary.hasDisplayLink });
    $$renderer2.push(`<!----> `);
    Host_info_system_banner($$renderer2, { system: summary.system });
    $$renderer2.push(`<!----> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, { title: "Storage", count: disks.length, Icon: Hard_drive });
    $$renderer2.push(`<!----> `);
    if (disks.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No disks reported.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(disks);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let disk = each_array[$$index];
        Host_info_disk_card($$renderer2, { disk });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, {
      title: "Network Adapters",
      count: adapters.length,
      Icon: Network
    });
    $$renderer2.push(`<!----> `);
    if (adapters.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No adapters reported.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_1 = ensure_array_like(adapters);
      for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
        let adapter = each_array_1[idx];
        Host_info_network_card($$renderer2, { adapter });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, { title: "USB Devices", count: usbDevices.length, Icon: Usb });
    $$renderer2.push(`<!----> `);
    if (usbDevices.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No USB devices reported.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(usbDevices);
      for (let idx = 0, $$length = each_array_2.length; idx < $$length; idx++) {
        let device = each_array_2[idx];
        Host_info_usb_card($$renderer2, { device });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    Host_info_audio_section($$renderer2, { audio: summary.audio });
    $$renderer2.push(`<!----> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, { title: "Input Devices", count: inputDevices.length });
    $$renderer2.push(`<!----> <div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-2.5">`);
    if (inputDevices.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-[12px] text-muted-foreground">No HID devices reported.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_3 = ensure_array_like(inputDevices);
      for (let idx = 0, $$length = each_array_3.length; idx < $$length; idx++) {
        let device = each_array_3[idx];
        Host_info_input_device_row($$renderer2, { device });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div> `);
    if (bluetoothDevices.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="space-y-2">`);
      Host_info_section_header($$renderer2, {
        title: "Bluetooth (Serial)",
        count: bluetoothDevices.length,
        Icon: Bluetooth
      });
      $$renderer2.push(`<!----> <div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-2.5"><!--[-->`);
      const each_array_4 = ensure_array_like(bluetoothDevices);
      for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
        let d = each_array_4[$$index_4];
        $$renderer2.push(`<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">`);
        Bluetooth($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="text-[12px] font-medium text-foreground">${escape_html(d.name)}</span> <span class="ml-auto font-mono text-[11px] text-muted-foreground">${escape_html(d.port)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, { title: "Printers", count: printers.length, Icon: Printer });
    $$renderer2.push(`<!----> <div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-2.5">`);
    if (printers.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-[12px] text-muted-foreground">None detected.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_5 = ensure_array_like(printers);
      for (let idx = 0, $$length = each_array_5.length; idx < $$length; idx++) {
        let p = each_array_5[idx];
        $$renderer2.push(`<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">`);
        Printer($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="text-[12px] font-medium text-foreground">${escape_html(p.name)}</span> `);
        if (p.isDefault === true) {
          $$renderer2.push("<!--[-->");
          Badge($$renderer2, {
            variant: "success",
            class: "text-[10px] ml-auto",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->Default`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span class="ml-auto"></span>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, { title: "Cameras", count: cameras.length, Icon: Camera });
    $$renderer2.push(`<!----> `);
    if (cameras.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-[12px] text-muted-foreground">No dedicated cameras reported.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-2.5"><!--[-->`);
      const each_array_6 = ensure_array_like(cameras);
      for (let idx = 0, $$length = each_array_6.length; idx < $$length; idx++) {
        let c = each_array_6[idx];
        $$renderer2.push(`<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">`);
        Camera($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="text-[12px] font-medium text-foreground">${escape_html(c.name)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="space-y-2">`);
    Host_info_section_header($$renderer2, {
      title: "Smart Card Readers",
      count: smartCardReaders.length,
      Icon: Credit_card
    });
    $$renderer2.push(`<!----> `);
    if (smartCardReaders.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-[12px] text-muted-foreground">None detected.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><div class="px-4 py-2.5"><!--[-->`);
      const each_array_7 = ensure_array_like(smartCardReaders);
      for (let idx = 0, $$length = each_array_7.length; idx < $$length; idx++) {
        let r = each_array_7[idx];
        $$renderer2.push(`<div class="flex items-center gap-2 border-b border-border/50 py-2 last:border-b-0">`);
        Credit_card($$renderer2, { class: "size-4 text-muted-foreground" });
        $$renderer2.push(`<!----> <span class="text-[12px] font-medium text-foreground">${escape_html(r.name)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function Tree_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, class: className } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(cn("flex flex-col", className)))}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function Tree_view_file($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      name,
      icon,
      meta,
      type = "button",
      class: className,
      children,
      $$slots,
      $$events,
      ...rest
    } = $$props;
    let hasMeta = !!meta;
    $$renderer2.push(`<button${attributes({
      type,
      class: clsx(cn(
        "grid w-full items-start gap-x-3 pl-[3px]",
        hasMeta ? "grid-cols-[minmax(0,1fr)_var(--tv-meta-width)]" : "grid-cols-[minmax(0,1fr)]",
        className
      )),
      ...rest
    })}><span class="inline-flex min-w-0 items-center gap-1">`);
    if (icon) {
      $$renderer2.push("<!--[-->");
      icon($$renderer2, { name });
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      File($$renderer2, { class: "size-4" });
    }
    $$renderer2.push(`<!--]--> <span class="min-w-0 break-all">${escape_html(name)}</span></span> `);
    if (meta) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="min-w-0">`);
      meta($$renderer2, { name });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    children?.($$renderer2);
    $$renderer2.push(`<!----></button>`);
  });
}
function Tree_view_folder($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { name, open = true, class: className, icon, meta, children } = $$props;
    let hasMeta = !!meta;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div${attr_class(clsx(cn(
            "grid w-full items-start gap-x-3",
            hasMeta ? "grid-cols-[minmax(0,1fr)_var(--tv-meta-width)]" : "grid-cols-[minmax(0,1fr)]",
            className
          )))}><!---->`);
          Collapsible_trigger($$renderer4, {
            class: "inline-flex min-w-0 items-center gap-1",
            children: ($$renderer5) => {
              if (icon) {
                $$renderer5.push("<!--[-->");
                icon($$renderer5, { name, open });
                $$renderer5.push(`<!---->`);
              } else {
                $$renderer5.push("<!--[!-->");
                if (open) {
                  $$renderer5.push("<!--[-->");
                  Folder_open($$renderer5, { class: "size-4" });
                } else {
                  $$renderer5.push("<!--[!-->");
                  Folder($$renderer5, { class: "size-4" });
                }
                $$renderer5.push(`<!--]-->`);
              }
              $$renderer5.push(`<!--]--> <span class="min-w-0 break-all">${escape_html(name)}</span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          if (meta) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="min-w-0">`);
            meta($$renderer4, { name, open });
            $$renderer4.push(`<!----></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]--></div> <!---->`);
          Collapsible_content($$renderer4, {
            class: "mx-2 border-l",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="relative flex w-full items-start"><div class="bg-border mx-2 h-full w-px"></div> <div class="flex min-w-0 flex-1 flex-col">`);
              children?.($$renderer5);
              $$renderer5.push(`<!----></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { open });
  });
}
function Launchd_info_tree_node($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    let owner = node.meta?.owner;
    let size2 = node.meta?.sizeHuman ?? (node.meta?.sizeBytes !== void 0 ? `${node.meta.sizeBytes} B` : void 0);
    let modified = node.meta?.modified?.raw;
    let permissions = node.meta?.permissions;
    if (node.kind === "folder") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!---->`);
      {
        let meta = function($$renderer3, { name, open }) {
          $$renderer3.push(`<div class="min-w-0 text-right font-mono text-[10px] text-muted-foreground">`);
          if (owner) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span${attr_class(clsx(owner === "root" || owner === "_unknown" ? "text-destructive" : ""))}>${escape_html(owner)}</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div>`);
        }, children = function($$renderer3) {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(node.children);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let child = each_array[$$index];
            Launchd_info_tree_node($$renderer3, { node: child });
          }
          $$renderer3.push(`<!--]-->`);
        };
        Tree_view_folder($$renderer2, {
          name: node.name,
          meta,
          children,
          $$slots: { meta: true, default: true }
        });
      }
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!---->`);
      {
        let meta = function($$renderer3, { name }) {
          $$renderer3.push(`<div class="grid min-w-0 grid-cols-[max-content_max-content_1fr] items-center justify-end gap-x-2 text-right font-mono text-[10px] text-muted-foreground"><span class="whitespace-nowrap">${escape_html(size2 ?? "—")}</span> <span class="whitespace-nowrap">`);
          if (permissions) {
            $$renderer3.push("<!--[-->");
            Unix_permissions($$renderer3, { permissions, variant: "subtle" });
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`—`);
          }
          $$renderer3.push(`<!--]--></span> <span class="min-w-0 truncate whitespace-nowrap">`);
          if (owner) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span${attr_class(clsx(owner === "root" || owner === "_unknown" ? "text-destructive" : ""))}>${escape_html(owner)}</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`—`);
          }
          $$renderer3.push(`<!--]--> `);
          if (modified) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<span class="opacity-70">${escape_html(modified)}</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></span></div>`);
        };
        Tree_view_file($$renderer2, {
          name: node.name,
          type: "button",
          meta,
          $$slots: { meta: true }
        });
      }
      $$renderer2.push(`<!---->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Launchd_info_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    let tree = summary.tree;
    let stats = summary.stats;
    $$renderer2.push(`<div class="rv-section-block"><div class="rv-section-heading">Overview</div> `);
    if (stats) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">Entries</div> <div class="rv-row-value"><span class="font-mono text-[11px] text-muted-foreground">${escape_html(stats.folders)} folders, ${escape_html(stats.files)} files</span></div></div> <div class="rv-row"><div class="rv-row-label">Root-owned files</div> <div class="rv-row-value"><span class="font-mono text-[11px] text-muted-foreground">${escape_html(stats.rootOwnedFiles)}</span></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="rv-row"><div class="rv-row-label">Status</div> <div class="rv-row-value">No parsed stats</div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rv-section-block"><div class="rv-section-heading">Tree</div> `);
    if (tree) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rounded-md border border-border bg-background p-2" style="--tv-meta-width: 18rem;"><!---->`);
      Tree_view($$renderer2, {
        class: "gap-1",
        children: ($$renderer3) => {
          Launchd_info_tree_node($$renderer3, { node: tree });
        }
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="rv-empty">No tree parsed (fallback listing only).</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="rv-section-block"><div class="rv-section-heading">Raw listing (copy)</div> <div class="rv-row"><div class="rv-row-label">Text</div> <div class="rv-row-value">`);
    Copy_button($$renderer2, {
      text: summary.formattedListing,
      size: "sm",
      variant: "ghost",
      class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Copy formatted listing`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div></div>`);
  });
}
function fmtGi(gi) {
  if (!Number.isFinite(gi)) return "—";
  if (gi >= 1024) return `${(gi / 1024).toFixed(1)} TB`;
  if (gi >= 1) return `${Math.round(gi)} GB`;
  if (gi >= 1e-3) return `${Math.round(gi * 1024)} MB`;
  return `${Math.round(gi * 1024 * 1024)} KB`;
}
function statusColor(pct) {
  if (pct >= 90) return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", bar: "bg-red-500" };
  if (pct >= 70) return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", bar: "bg-amber-500" };
  return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", bar: "bg-blue-500" };
}
function Mount_info_volume_row($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { vol } = $$props;
    $$renderer2.push(`<div class="grid grid-cols-[10px_minmax(0,1fr)_90px_minmax(0,1fr)] items-center gap-2 border-b border-border/40 py-1.5 text-[12px]"><div class="size-2.5 rounded-sm"${attr_style("", { background: vol.color })}></div> <div class="min-w-0"><span class="font-medium text-foreground">${escape_html(vol.label)}</span> <span class="ml-1 font-mono text-[11px] text-muted-foreground">${escape_html(vol.id)}</span></div> <div class="text-right font-mono text-[12px] font-semibold text-foreground/80">${escape_html(fmtGi(vol.usedGi))}</div> <div class="min-w-0 truncate font-mono text-[11px] text-muted-foreground"${attr("title", vol.mount)}>${escape_html(vol.mount)}</div></div>`);
  });
}
function Mount_info_disk_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { disk } = $$props;
    let open = false;
    let st = statusColor(disk.capacityPercent);
    function segmentsFor(d) {
      const container = d.containerSizeGi || 0;
      if (container <= 0) return [];
      const usedTotal = d.volumes.reduce((s, v) => s + (v.usedGi || 0), 0);
      const overhead = Math.max(0, container - (d.freeGi || 0) - usedTotal);
      const segs2 = d.volumes.filter((v) => (v.usedGi || 0) > 0).map((v) => ({
        key: v.id,
        label: v.label,
        valueGi: v.usedGi,
        pct: v.usedGi / container * 100,
        color: v.color
      }));
      if (overhead > 0.5) {
        segs2.push({
          key: "overhead",
          label: "Overhead / Snapshots",
          valueGi: overhead,
          pct: overhead / container * 100,
          color: "#CBD5E1"
        });
      }
      return segs2;
    }
    let segs = segmentsFor(disk);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 pt-3 text-left",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> <span${attr_class(`size-2 rounded-full ${st.dot}`)}></span> <span class="text-[13px] font-semibold text-foreground">${escape_html(disk.label)}</span> `);
              Badge($$renderer5, {
                variant: "outline",
                class: "text-[10px]",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(disk.filesystem)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span${attr_class(`ml-auto rounded px-2 py-0.5 font-mono text-[12px] font-semibold ${st.bg} ${st.text}`)}>${escape_html(disk.capacityPercent)}%</span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <div class="px-4 pb-3 pt-2"><div class="h-6 w-full overflow-hidden rounded-md border border-border bg-muted/40"><div class="flex h-full w-full"><!--[-->`);
          const each_array = ensure_array_like(segs);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let seg = each_array[$$index];
            $$renderer4.push(`<div class="h-full"${attr("title", `${seg.label}: ${fmtGi(seg.valueGi)} (${seg.pct.toFixed(1)}%)`)}${attr_style("", { width: `${Math.max(seg.pct, 0.3)}%`, background: seg.color })}></div>`);
          }
          $$renderer4.push(`<!--]--></div></div> <div class="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground"><span><span class="font-semibold text-foreground/80">${escape_html(fmtGi(disk.usedGi))}</span> used</span> <span><span class="font-semibold text-foreground/80">${escape_html(fmtGi(disk.freeGi))}</span> free of  <span class="font-semibold text-foreground/80">${escape_html(fmtGi(disk.containerSizeGi))}</span></span></div></div> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Volumes (${escape_html(disk.volumes.length)})</div> <div class="space-y-0"><!--[-->`);
              const each_array_1 = ensure_array_like(disk.volumes);
              for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                let vol = each_array_1[$$index_1];
                Mount_info_volume_row($$renderer5, { vol });
              }
              $$renderer5.push(`<!--]--></div> <div class="mt-2 font-mono text-[10px] text-muted-foreground">Container: /dev/${escape_html(disk.diskId)} · APFS shared pool · ${escape_html(disk.volumes.length)} volumes</div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Mount_info_share_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { share } = $$props;
    let open = false;
    let st = statusColor(share.capacityPercent);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 pt-3 text-left",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> <span${attr_class(`size-2 rounded-full ${st.dot}`)}></span> <span class="text-[13px] font-semibold text-foreground">${escape_html(share.label)}</span> `);
              Badge($$renderer5, {
                variant: "secondary",
                class: "text-[10px]",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(share.protocol)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span${attr_class(`ml-auto rounded px-2 py-0.5 font-mono text-[12px] font-semibold ${st.bg} ${st.text}`)}>${escape_html(share.capacityPercent)}%</span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <div class="px-4 pb-3 pt-2"><div class="h-6 w-full overflow-hidden rounded-md border border-border bg-muted/40"><div${attr_class(`h-full ${st.bar}`)}${attr_style("", {
            width: `${Math.max(0, Math.min(100, share.capacityPercent))}%`
          })}></div></div> <div class="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground"><span><span class="font-semibold text-foreground/80">${escape_html(fmtGi(share.usedGi))}</span> used</span> <span><span class="font-semibold text-foreground/80">${escape_html(fmtGi(share.freeGi))}</span> free of  <span class="font-semibold text-foreground/80">${escape_html(fmtGi(share.sizeGi))}</span></span></div></div> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="space-y-1 font-mono text-[11px] text-muted-foreground"><div><span class="text-muted-foreground/70">Source:</span> <span class="text-foreground/80 break-all">${escape_html(share.source)}</span></div> <div><span class="text-muted-foreground/70">Mount:</span> <span class="text-foreground/80 break-all">${escape_html(share.mountPoint)}</span></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Mount_info_disk_visualization($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let significant = data.localDisks.filter((d) => d.significant);
    let minor = data.localDisks.filter((d) => !d.significant);
    if (data.meta.parseWarnings.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800"><div class="font-semibold">MountInfo parse warnings</div> <ul class="mt-1 list-disc pl-5"><!--[-->`);
      const each_array = ensure_array_like(data.meta.parseWarnings);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let w = each_array[$$index];
        $$renderer2.push(`<li>${escape_html(w)}</li>`);
      }
      $$renderer2.push(`<!--]--></ul></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="mb-2"><div class="text-[13px] font-semibold text-foreground">Storage Overview</div> <div class="mt-0.5 text-[11px] text-muted-foreground">${escape_html(data.localDisks.length)} local disk${escape_html(data.localDisks.length === 1 ? "" : "s")} ·
    ${escape_html(data.networkShares.length)} network share${escape_html(data.networkShares.length === 1 ? "" : "s")}</div></div> `);
    if (data.alerts.hddFull || data.alerts.lowStorage || data.alerts.hasNtfs) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mb-3 space-y-2">`);
      if (data.alerts.hddFull) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-md border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">Disk full — a local disk is at ≥ 99% capacity</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (data.alerts.lowStorage) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-700">Low storage — a local disk is at ≥ 90% capacity</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (data.alerts.hasNtfs) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-700">NTFS volume detected — may cause macOS compatibility issues</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="mt-4 flex items-center gap-2"><div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Local Disks</div> `);
    Badge($$renderer2, {
      variant: "outline",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(data.localDisks.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> <div class="h-px flex-1 bg-border/70"></div></div> <div class="mt-2 space-y-2"><!--[-->`);
    const each_array_1 = ensure_array_like(significant);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let disk = each_array_1[$$index_1];
      Mount_info_disk_card($$renderer2, { disk });
    }
    $$renderer2.push(`<!--]--> `);
    if (minor.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rounded-xl border border-border bg-background p-4 text-[12px] text-muted-foreground">${escape_html(minor.length)} minor system disk${escape_html(minor.length === 1 ? "" : "s")} hidden (not significant)</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (data.networkShares.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-6 flex items-center gap-2"><div class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Network Shares</div> `);
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px]",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(data.networkShares.length)}`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> <div class="h-px flex-1 bg-border/70"></div></div> <div class="mt-2 space-y-2"><!--[-->`);
      const each_array_2 = ensure_array_like(data.networkShares);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let share = each_array_2[$$index_2];
        Mount_info_share_card($$renderer2, { share });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Mount_info_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    if (summary.parsed) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-section-block">`);
      Mount_info_disk_visualization($$renderer2, { data: summary.parsed });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function resLabel(w, h) {
  return `${w}×${h}`;
}
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function aspectRatio(w, h) {
  if (!w || !h) return "—";
  const d = gcd(w, h);
  const aw = Math.round(w / d);
  const ah = Math.round(h / d);
  if (aw === 64 && ah === 27) return "21:9";
  if (aw === 32 && ah === 9) return "32:9";
  if (aw === 16 && ah === 9) return "16:9";
  if (aw === 16 && ah === 10) return "16:10";
  if (aw === 756 && ah === 491) return "~3:2";
  if (aw > 20 && ah > 0) return `~${(aw / ah).toFixed(1)}:1`;
  return `${aw}:${ah}`;
}
function scaleFactor(physical, logical) {
  if (!physical || !logical) return null;
  const factor = physical / logical;
  if (Math.abs(factor - 2) < 0.1) return "2×";
  if (Math.abs(factor - 3) < 0.1) return "3×";
  if (Math.abs(factor - 1) < 0.05) return null;
  return `${factor.toFixed(1)}×`;
}
function gpuTypeLabel(type) {
  if (type === "integrated") return "Integrated";
  if (type === "discrete") return "Discrete";
  return "GPU";
}
function gpuTypeBadgeClass(type) {
  if (type === "discrete") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-border bg-muted/20 text-muted-foreground";
}
function totalDisplays(gpus) {
  return gpus.reduce((s, g) => s + (g.displays?.length ?? 0), 0);
}
function computeDisplayMiniatures(displays) {
  const pixels = displays.map((d) => (d.logicalWidth || 0) * (d.logicalHeight || 0));
  const maxPixels = Math.max(...pixels, 1);
  const refWidth = 160;
  return displays.map((d) => {
    const ratio = d.logicalHeight ? d.logicalWidth / d.logicalHeight : 1;
    const areaRatio = (d.logicalWidth || 0) * (d.logicalHeight || 0) / maxPixels;
    const scale = Math.sqrt(Math.max(areaRatio, 0));
    const w = refWidth * scale * (ratio > 1 ? 1 : ratio);
    const h = ratio ? w / ratio : w;
    return {
      ...d,
      renderW: Math.max(w, 40),
      renderH: Math.max(h, 25)
    };
  });
}
function More_host_info_display_layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { displays } = $$props;
    const minis = computeDisplayMiniatures(displays);
    $$renderer2.push(`<div class="flex items-end justify-center gap-3.5 bg-muted/15 px-4 pb-4 pt-5"><!--[-->`);
    const each_array = ensure_array_like(minis);
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let d = each_array[idx];
      $$renderer2.push(`<div class="flex flex-col items-center gap-1.5"><div${attr_class("relative flex flex-col items-center justify-center gap-0.5 rounded border shadow-sm", void 0, {
        "border-blue-500": d.builtin,
        "bg-blue-50": d.builtin,
        "border-slate-400": !d.builtin,
        "bg-background": !d.builtin
      })}${attr_style("", { width: `${d.renderW}px`, height: `${d.renderH}px` })}><span${attr_class(`font-mono font-bold ${d.renderW > 80 ? "text-[10px]" : "text-[8px]"} ${d.builtin ? "text-blue-600" : "text-slate-600"}`)}>${escape_html(resLabel(d.logicalWidth, d.logicalHeight))}</span> `);
      if (d.refreshRate && d.renderW > 80) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="font-mono text-[8px] font-semibold text-emerald-600">${escape_html(d.refreshRate)}Hz</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (d.builtin) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute left-1/2 top-0 h-1 w-4 -translate-x-1/2 rounded-b bg-blue-600"></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (!d.builtin) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="h-1.5 w-3 rounded-b bg-slate-300"></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <span class="max-w-[220px] text-center text-[10px] font-medium text-muted-foreground">${escape_html(d.builtin ? "Built-in" : d.name)}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function More_host_info_display_row($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { display } = $$props;
    const ratio = aspectRatio(display.logicalWidth, display.logicalHeight);
    const scale = scaleFactor(display.physicalWidth, display.logicalWidth);
    const isHiDpi = display.physicalWidth !== display.logicalWidth || display.physicalHeight !== display.logicalHeight;
    $$renderer2.push(`<div class="flex items-center gap-3 py-2 border-b border-border/40 last:border-b-0"><div class="shrink-0 text-muted-foreground">`);
    if (display.builtin) {
      $$renderer2.push("<!--[-->");
      Laptop($$renderer2, { class: "size-4" });
    } else {
      $$renderer2.push("<!--[!-->");
      Monitor($$renderer2, { class: "size-4" });
    }
    $$renderer2.push(`<!--]--></div> <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5 flex-wrap"><span class="text-[13px] font-semibold text-foreground">${escape_html(display.name)}</span> `);
    if (display.builtin) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px] border-blue-200 bg-blue-50 text-blue-700",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->Built-in`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    Badge($$renderer2, {
      variant: "outline",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(ratio)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (display.refreshRate) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(display.refreshRate)} Hz`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (scale) {
      $$renderer2.push("<!--[-->");
      Badge($$renderer2, {
        variant: "outline",
        class: "text-[10px] border-violet-200 bg-violet-50 text-violet-700",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->${escape_html(scale)} HiDPI`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="shrink-0 text-right"><div class="font-mono text-[12px] font-semibold text-slate-700">${escape_html(resLabel(display.logicalWidth, display.logicalHeight))}</div> `);
    if (isHiDpi) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="font-mono text-[10.5px] text-muted-foreground">${escape_html(resLabel(display.physicalWidth, display.physicalHeight))} native</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function More_host_info_gpu_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { gpu } = $$props;
    let open = true;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-3 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> `);
              Zap($$renderer5, { class: "size-4 text-muted-foreground" });
              $$renderer5.push(`<!----> <span class="text-[13px] font-bold text-foreground">${escape_html(gpu.name)}</span> `);
              Badge($$renderer5, {
                variant: "outline",
                class: `text-[10px] ${gpuTypeBadgeClass(gpu.type)}`,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(gpuTypeLabel(gpu.type))}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="ml-auto">`);
              Badge($$renderer5, {
                variant: "muted",
                class: "text-[10px]",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(gpu.displays.length)} display${escape_html(gpu.displays.length === 1 ? "" : "s")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----></span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50",
            children: ($$renderer5) => {
              More_host_info_display_layout($$renderer5, { displays: gpu.displays });
              $$renderer5.push(`<!----> <div class="px-4 pb-3 pt-1"><!--[-->`);
              const each_array = ensure_array_like(gpu.displays);
              for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
                let d = each_array[idx];
                More_host_info_display_row($$renderer5, { display: d });
              }
              $$renderer5.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function More_host_info_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    const gpus = summary.gpus ?? [];
    const displayTotal = totalDisplays(gpus);
    $$renderer2.push(`<div class="space-y-3"><div class="flex items-center gap-2"><div class="text-[13px] font-semibold text-foreground">GPUs &amp; Displays</div> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(gpus.length)} GPU${escape_html(gpus.length === 1 ? "" : "s")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(displayTotal)} display${escape_html(displayTotal === 1 ? "" : "s")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (gpus.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No GPU information available.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(gpus);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let gpu = each_array[idx];
        More_host_info_gpu_card($$renderer2, { gpu });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function netTypeShort(net) {
  const name = (net.name || "").toLowerCase();
  if (name.includes("shared")) return "Shared";
  if (name.includes("host only") || name.includes("host-only") || name.includes("hostonly")) return "Host-Only";
  if (name.includes("bridged")) return "Bridged";
  return "Unknown";
}
function netTypeLong(short) {
  switch (short) {
    case "Shared":
      return "Shared Networking";
    case "Host-Only":
      return "Host Only Networking";
    case "Bridged":
      return "Bridged Networking";
    default:
      return "Unknown";
  }
}
function maskSuffix(mask) {
  if (!mask) return null;
  const parts = mask.split(".");
  if (parts.length === 4) return parts[3] || null;
  return mask;
}
function isEnabled(v) {
  if (v == null) return null;
  const s = v.trim().toLowerCase();
  if (s === "1" || s === "true" || s === "yes") return true;
  if (s === "0" || s === "false" || s === "no") return false;
  return null;
}
function Net_config_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { net, index } = $$props;
    let open = false;
    const typeShort = netTypeShort(net);
    const typeLong = netTypeLong(typeShort);
    const hasDhcpIp = Boolean(net.dhcpIp);
    const dotClass = hasDhcpIp ? "bg-emerald-500" : "bg-slate-300";
    const netMaskSuffix = maskSuffix(net.netMask);
    const dhcpEnabled = isEnabled(net.dhcpEnabled);
    const dhcpV6Enabled = isEnabled(net.dhcpV6Enabled);
    function typeBadgeClass(t) {
      if (t === "Shared") return "border-blue-200 bg-blue-50 text-blue-700";
      if (t === "Host-Only") return "border-violet-200 bg-violet-50 text-violet-700";
      if (t === "Bridged") return "border-emerald-200 bg-emerald-50 text-emerald-700";
      return "border-border bg-muted/20 text-muted-foreground";
    }
    function enabledText(v) {
      if (v === true) return "✓ Enabled";
      if (v === false) return "✗ Disabled";
      return "Unknown";
    }
    function enabledClass(v) {
      if (v === true) return "text-emerald-700";
      if (v === false) return "text-rose-700";
      return "text-muted-foreground";
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> <span${attr_class(`size-2 rounded-full ${dotClass}`)}></span> <span class="text-[13px] font-semibold text-foreground">${escape_html(net.name ?? `Network ${index + 1}`)}</span> `);
              Badge($$renderer5, {
                variant: "outline",
                class: `text-[10px] ${typeBadgeClass(typeShort)}`,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(typeShort)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="ml-auto font-mono text-[12px]">`);
              if (net.dhcpIp) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-slate-700">${escape_html(net.dhcpIp)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
                $$renderer5.push(`<span class="text-muted-foreground">No IP</span>`);
              }
              $$renderer5.push(`<!--]--> `);
              if (netMaskSuffix) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="text-muted-foreground">/ ${escape_html(netMaskSuffix)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">Type</span> <span class="font-mono text-foreground/80">${escape_html(typeLong)}</span> <span class="text-muted-foreground/80 font-medium">DHCP IP</span> <span class="font-mono text-foreground/80">${escape_html(net.dhcpIp ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">Net Mask</span> <span class="font-mono text-foreground/80">${escape_html(net.netMask ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">Host IP</span> <span class="font-mono text-foreground/80">${escape_html(net.hostIp ?? "—")}</span> <span class="text-muted-foreground/80 font-medium">DHCP</span> <span${attr_class(`font-mono ${enabledClass(dhcpEnabled)}`)}>${escape_html(enabledText(dhcpEnabled))}</span> <span class="text-muted-foreground/80 font-medium">IPv6 DHCP</span> <span${attr_class(`font-mono ${enabledClass(dhcpV6Enabled)}`)}>${escape_html(enabledText(dhcpV6Enabled))}</span></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Net_config_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    const networks = summary.networks ?? [];
    const kextlessMode = summary.kextlessMode ?? "unknown";
    $$renderer2.push(`<div class="space-y-4"><div><div class="flex items-center gap-2"><div class="text-[13px] font-semibold text-foreground">Virtual Networks</div> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(networks.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (kextlessMode !== "unknown") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-1 text-[11px] text-muted-foreground font-mono">Kextless Mode: ${escape_html(kextlessMode)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (networks.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No virtual networks parsed.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(networks);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let net = each_array[idx];
        Net_config_card($$renderer2, { net, index: idx });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function shortHomePath(path) {
  if (!path) return "—";
  return path.replace(/^\/Users\/[^/]+\//, "~/");
}
function parseRegisteredDate(input) {
  if (!input) return null;
  const isoish = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(isoish);
  return Number.isFinite(d.getTime()) ? d : null;
}
function timeAgo(input, now = /* @__PURE__ */ new Date()) {
  const d = parseRegisteredDate(input);
  if (!d) return null;
  const ms = now.getTime() - d.getTime();
  const days = Math.floor(ms / 864e5);
  if (!Number.isFinite(days)) return null;
  if (days < 0) return "in future";
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
function Vm_directory_card($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { vm, now = /* @__PURE__ */ new Date() } = $$props;
    let open = false;
    const ago = timeAgo(vm.registeredOn, now);
    const locationShort = shortHomePath(vm.location);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="overflow-hidden rounded-xl border border-border bg-background"><!---->`);
      Collapsible($$renderer3, {
        get open() {
          return open;
        },
        set open($$value) {
          open = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->`);
          Collapsible_trigger($$renderer4, {
            class: "flex w-full items-center gap-2 px-4 py-2.5 text-left select-none",
            children: ($$renderer5) => {
              Chevron_right($$renderer5, {
                class: `size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-0"}`
              });
              $$renderer5.push(`<!----> `);
              Monitor($$renderer5, { class: "size-4 text-muted-foreground" });
              $$renderer5.push(`<!----> <span class="text-[13px] font-semibold text-foreground">${escape_html(vm.name ?? "Virtual Machine")}</span> <span class="ml-auto flex items-center gap-2">`);
              if (ago) {
                $$renderer5.push("<!--[-->");
                $$renderer5.push(`<span class="font-mono text-[11px] text-muted-foreground">${escape_html(ago)}</span>`);
              } else {
                $$renderer5.push("<!--[!-->");
              }
              $$renderer5.push(`<!--]--></span>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> <!---->`);
          Collapsible_content($$renderer4, {
            class: "border-t border-border/50 bg-muted/15 px-4 py-3",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-[12px]"><span class="text-muted-foreground/80 font-medium">Location</span> `);
              Copy_button($$renderer5, {
                text: vm.location ?? "",
                size: "sm",
                variant: "ghost",
                class: "h-auto min-h-6 px-2 font-mono text-[11.5px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(locationShort)}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="text-muted-foreground/80 font-medium">UUID</span> `);
              Copy_button($$renderer5, {
                text: vm.uuid ?? "",
                size: "sm",
                variant: "ghost",
                class: "h-auto min-h-6 px-2 font-mono text-[11.5px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(vm.uuid ?? "—")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> <span class="text-muted-foreground/80 font-medium">Registered</span> <span class="font-mono text-[11.5px] text-muted-foreground">${escape_html(vm.registeredOn ?? "—")}</span></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Vm_directory_view($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { summary } = $$props;
    const vms = summary.vms ?? [];
    const now = /* @__PURE__ */ new Date();
    $$renderer2.push(`<div class="space-y-3"><div class="flex items-center gap-2"><div class="text-[13px] font-semibold text-foreground">Virtual Machines</div> `);
    Badge($$renderer2, {
      variant: "muted",
      class: "text-[10px]",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(vms.length)}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (vms.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="rv-empty">No VMs found.</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="space-y-2"><!--[-->`);
      const each_array = ensure_array_like(vms);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let vm = each_array[idx];
        Vm_directory_card($$renderer2, { vm, now });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function Report_viewer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { context = "reportus", nodes, markers = [] } = $$props;
    let query = "";
    let open = /* @__PURE__ */ new Set();
    let subSectionStates = {};
    function matchesFilter(node, row) {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const inTitle = node.title.toLowerCase().includes(q);
      const inLabel = row.label.toLowerCase().includes(q);
      const inValue = (row.value || "").toLowerCase().includes(q);
      return inTitle || inLabel || inValue;
    }
    function badgeIconComponent(iconKey) {
      switch (iconKey) {
        case "hdd":
          return Hard_drive;
        case "net":
          return Network;
        case "travel":
          return Plane;
        case "vm":
          return Monitor;
        case "warn":
          return Triangle_alert;
        case "keyboard":
          return Keyboard;
        case "mouse":
          return Mouse;
        case "cd":
        case "disc":
          return Disc;
        case "camera":
          return Webcam;
        case "bluetooth":
          return Bluetooth;
        case "usb":
          return Usb;
        case "printer":
          return Printer;
        case "cloud":
          return Cloud;
        case "folder":
          return Folder_open;
        case "clipboard":
          return Clipboard;
        case "clock":
          return Clock;
        case "shield":
          return Shield;
        case "cpu":
          return Cpu;
        default:
          return null;
      }
    }
    function getSubSectionKey(nodeId, sectionTitle, subId) {
      return `${nodeId}::${sectionTitle}::${subId}`;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div${attr_class(`rv-shell ${""}`)}><header class="rv-header"><div><p class="rv-title">Report Viewer</p> `);
      Badge$1($$renderer3, {
        variant: "default",
        class: "text-xs",
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(context)}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></header> `);
      Input($$renderer3, {
        type: "search",
        placeholder: "Search nodes, logs, assets...",
        "aria-label": "Search nodes",
        class: "mb-2.5",
        get value() {
          return query;
        },
        set value($$value) {
          query = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="rv-scroll"><!--[-->`);
      const each_array = ensure_array_like(nodes);
      for (let $$index_5 = 0, $$length = each_array.length; $$index_5 < $$length; $$index_5++) {
        let node = each_array[$$index_5];
        $$renderer3.push(`<div class="rv-node"><div class="rv-node-header" role="button" tabindex="0"><div class="rv-node-title"><span>${escape_html(node.title)}</span> `);
        if (node.badges.length) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<span class="rv-tags"><!--[-->`);
          const each_array_1 = ensure_array_like(node.badges);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let badge = each_array_1[$$index];
            const variant = badge.tone === "danger" ? "destructive" : badge.tone === "warn" ? "default" : "outline";
            Badge$1($$renderer3, {
              variant,
              class: "text-[11px] gap-1",
              children: ($$renderer4) => {
                if (badgeIconComponent(badge.iconKey)) {
                  $$renderer4.push("<!--[-->");
                  const IconComponent = badgeIconComponent(badge.iconKey);
                  if (IconComponent) {
                    $$renderer4.push("<!--[-->");
                    $$renderer4.push(`<!---->`);
                    IconComponent($$renderer4, { size: 12 });
                    $$renderer4.push(`<!---->`);
                  } else {
                    $$renderer4.push("<!--[!-->");
                  }
                  $$renderer4.push(`<!--]-->`);
                } else {
                  $$renderer4.push("<!--[!-->");
                }
                $$renderer4.push(`<!--]--> ${escape_html(badge.label)}`);
              },
              $$slots: { default: true }
            });
          }
          $$renderer3.push(`<!--]--></span>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> <span>${escape_html(open.has(node.id) ? "−" : "+")}</span></div> `);
        if (open.has(node.id)) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="rv-node-body">`);
          if (node.id === "current-vm") {
            $$renderer3.push("<!--[-->");
            CompactCurrentVm($$renderer3, { node, markers });
          } else {
            $$renderer3.push("<!--[!-->");
            if (node.id === "advanced-vm-info") {
              $$renderer3.push("<!--[-->");
              const summary = node.data;
              if (summary) {
                $$renderer3.push("<!--[-->");
                Advanced_vm_info_view($$renderer3, { summary });
              } else {
                $$renderer3.push("<!--[!-->");
                $$renderer3.push(`<div class="rv-empty">No AdvancedVmInfo data</div>`);
              }
              $$renderer3.push(`<!--]-->`);
            } else {
              $$renderer3.push("<!--[!-->");
              if (node.id === "mount-info") {
                $$renderer3.push("<!--[-->");
                const summary = node.data;
                if (summary) {
                  $$renderer3.push("<!--[-->");
                  Mount_info_view($$renderer3, { summary });
                } else {
                  $$renderer3.push("<!--[!-->");
                  $$renderer3.push(`<div class="rv-empty">No MountInfo data</div>`);
                }
                $$renderer3.push(`<!--]-->`);
              } else {
                $$renderer3.push("<!--[!-->");
                if (node.id === "all-processes") {
                  $$renderer3.push("<!--[-->");
                  const summary = node.data;
                  if (summary) {
                    $$renderer3.push("<!--[-->");
                    All_processes_view($$renderer3, { summary });
                  } else {
                    $$renderer3.push("<!--[!-->");
                    $$renderer3.push(`<div class="rv-empty">No AllProcesses data</div>`);
                  }
                  $$renderer3.push(`<!--]-->`);
                } else {
                  $$renderer3.push("<!--[!-->");
                  if (node.id === "guest-commands") {
                    $$renderer3.push("<!--[-->");
                    const summary = node.data;
                    if (summary) {
                      $$renderer3.push("<!--[-->");
                      Guest_commands_view($$renderer3, { summary });
                    } else {
                      $$renderer3.push("<!--[!-->");
                      $$renderer3.push(`<div class="rv-empty">No GuestCommands data</div>`);
                    }
                    $$renderer3.push(`<!--]-->`);
                  } else {
                    $$renderer3.push("<!--[!-->");
                    if (node.id === "more-host-info") {
                      $$renderer3.push("<!--[-->");
                      const summary = node.data;
                      if (summary) {
                        $$renderer3.push("<!--[-->");
                        More_host_info_view($$renderer3, { summary });
                      } else {
                        $$renderer3.push("<!--[!-->");
                        $$renderer3.push(`<div class="rv-empty">No MoreHostInfo data</div>`);
                      }
                      $$renderer3.push(`<!--]-->`);
                    } else {
                      $$renderer3.push("<!--[!-->");
                      if (node.id === "host-info") {
                        $$renderer3.push("<!--[-->");
                        const summary = node.data;
                        if (summary) {
                          $$renderer3.push("<!--[-->");
                          Host_info_view($$renderer3, { summary });
                        } else {
                          $$renderer3.push("<!--[!-->");
                          $$renderer3.push(`<div class="rv-empty">No HostInfo data</div>`);
                        }
                        $$renderer3.push(`<!--]-->`);
                      } else {
                        $$renderer3.push("<!--[!-->");
                        if (node.id === "vm-directory") {
                          $$renderer3.push("<!--[-->");
                          const summary = node.data;
                          if (summary) {
                            $$renderer3.push("<!--[-->");
                            Vm_directory_view($$renderer3, { summary });
                          } else {
                            $$renderer3.push("<!--[!-->");
                            $$renderer3.push(`<div class="rv-empty">No VmDirectory data</div>`);
                          }
                          $$renderer3.push(`<!--]-->`);
                        } else {
                          $$renderer3.push("<!--[!-->");
                          if (node.id === "net-config") {
                            $$renderer3.push("<!--[-->");
                            const summary = node.data;
                            if (summary) {
                              $$renderer3.push("<!--[-->");
                              Net_config_view($$renderer3, { summary });
                            } else {
                              $$renderer3.push("<!--[!-->");
                              $$renderer3.push(`<div class="rv-empty">No NetConfig data</div>`);
                            }
                            $$renderer3.push(`<!--]-->`);
                          } else {
                            $$renderer3.push("<!--[!-->");
                            if (node.id === "launchd-info") {
                              $$renderer3.push("<!--[-->");
                              const summary = node.data;
                              if (summary) {
                                $$renderer3.push("<!--[-->");
                                Launchd_info_view($$renderer3, { summary });
                              } else {
                                $$renderer3.push("<!--[!-->");
                                $$renderer3.push(`<div class="rv-empty">No LaunchdInfo data</div>`);
                              }
                              $$renderer3.push(`<!--]-->`);
                            } else {
                              $$renderer3.push("<!--[!-->");
                              $$renderer3.push(`<!--[-->`);
                              const each_array_2 = ensure_array_like(node.sections);
                              for (let $$index_4 = 0, $$length2 = each_array_2.length; $$index_4 < $$length2; $$index_4++) {
                                let section = each_array_2[$$index_4];
                                $$renderer3.push(`<div class="rv-section-block"><div class="rv-section-heading">${escape_html(section.title)}</div> `);
                                if (section.rows.filter((r) => matchesFilter(node, r)).length === 0) {
                                  $$renderer3.push("<!--[-->");
                                  $$renderer3.push(`<div class="rv-empty">No matches</div>`);
                                } else {
                                  $$renderer3.push("<!--[!-->");
                                  $$renderer3.push(`<!--[-->`);
                                  const each_array_3 = ensure_array_like(section.rows.filter((r) => matchesFilter(node, r)));
                                  for (let idx = 0, $$length3 = each_array_3.length; idx < $$length3; idx++) {
                                    let row = each_array_3[idx];
                                    $$renderer3.push(`<div class="rv-row"><div class="rv-row-label">`);
                                    if (row.iconKey) {
                                      $$renderer3.push("<!--[-->");
                                      const IconComponent = badgeIconComponent(row.iconKey);
                                      if (IconComponent) {
                                        $$renderer3.push("<!--[-->");
                                        $$renderer3.push(`<!---->`);
                                        IconComponent($$renderer3, { size: 14, class: "inline mr-1.5 -mt-0.5" });
                                        $$renderer3.push(`<!---->`);
                                      } else {
                                        $$renderer3.push("<!--[!-->");
                                      }
                                      $$renderer3.push(`<!--]-->`);
                                    } else {
                                      $$renderer3.push("<!--[!-->");
                                    }
                                    $$renderer3.push(`<!--]--> ${escape_html(row.label)}</div> <div class="rv-row-value">`);
                                    if (row.badge) {
                                      $$renderer3.push("<!--[-->");
                                      Badge$1($$renderer3, {
                                        variant: row.badge.variant,
                                        class: "text-[11px]",
                                        children: ($$renderer4) => {
                                          $$renderer4.push(`<!---->${escape_html(row.badge.label)}`);
                                        },
                                        $$slots: { default: true }
                                      });
                                    } else {
                                      $$renderer3.push("<!--[!-->");
                                      if (row.value && (row.type === "path" || row.type === "uuid")) {
                                        $$renderer3.push("<!--[-->");
                                        Copy_button($$renderer3, {
                                          text: row.value,
                                          size: "sm",
                                          variant: "ghost",
                                          class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
                                          children: ($$renderer4) => {
                                            $$renderer4.push(`<!---->${escape_html(row.value)}`);
                                          },
                                          $$slots: { default: true }
                                        });
                                      } else {
                                        $$renderer3.push("<!--[!-->");
                                        if (row.value && row.type === "datetime") {
                                          $$renderer3.push("<!--[-->");
                                          $$renderer3.push(`<span class="font-mono text-[11px] text-muted-foreground">${escape_html(row.value)}</span>`);
                                        } else {
                                          $$renderer3.push("<!--[!-->");
                                          $$renderer3.push(`${escape_html(row.value)}`);
                                        }
                                        $$renderer3.push(`<!--]-->`);
                                      }
                                      $$renderer3.push(`<!--]-->`);
                                    }
                                    $$renderer3.push(`<!--]--></div></div>`);
                                  }
                                  $$renderer3.push(`<!--]-->`);
                                }
                                $$renderer3.push(`<!--]--> `);
                                if (section.subSections && section.subSections.length) {
                                  $$renderer3.push("<!--[-->");
                                  $$renderer3.push(`<!--[-->`);
                                  const each_array_4 = ensure_array_like(section.subSections);
                                  for (let $$index_3 = 0, $$length3 = each_array_4.length; $$index_3 < $$length3; $$index_3++) {
                                    let sub = each_array_4[$$index_3];
                                    const subKey = getSubSectionKey(node.id, section.title, sub.id);
                                    $$renderer3.push(`<div class="rv-sub-section"><div class="rv-sub-header" role="button" tabindex="0"><div class="rv-sub-title">`);
                                    if (badgeIconComponent(sub.iconKey)) {
                                      $$renderer3.push("<!--[-->");
                                      const IconComponent = badgeIconComponent(sub.iconKey);
                                      if (IconComponent) {
                                        $$renderer3.push("<!--[-->");
                                        $$renderer3.push(`<!---->`);
                                        IconComponent($$renderer3, { size: 13 });
                                        $$renderer3.push(`<!---->`);
                                      } else {
                                        $$renderer3.push("<!--[!-->");
                                      }
                                      $$renderer3.push(`<!--]-->`);
                                    } else {
                                      $$renderer3.push("<!--[!-->");
                                    }
                                    $$renderer3.push(`<!--]--> <span>${escape_html(sub.title)}</span></div> <span class="rv-sub-toggle">${escape_html(subSectionStates[subKey] ? "−" : "+")}</span></div> `);
                                    if (subSectionStates[subKey]) {
                                      $$renderer3.push("<!--[-->");
                                      $$renderer3.push(`<div class="rv-sub-body"><!--[-->`);
                                      const each_array_5 = ensure_array_like(sub.rows.filter((r) => matchesFilter(node, r)));
                                      for (let idx = 0, $$length4 = each_array_5.length; idx < $$length4; idx++) {
                                        let row = each_array_5[idx];
                                        $$renderer3.push(`<div class="rv-row"><div class="rv-row-label">${escape_html(row.label)}</div> <div class="rv-row-value">`);
                                        if (row.badge) {
                                          $$renderer3.push("<!--[-->");
                                          Badge$1($$renderer3, {
                                            variant: row.badge.variant,
                                            class: "text-[11px]",
                                            children: ($$renderer4) => {
                                              $$renderer4.push(`<!---->${escape_html(row.badge.label)}`);
                                            },
                                            $$slots: { default: true }
                                          });
                                        } else {
                                          $$renderer3.push("<!--[!-->");
                                          if (row.value && (row.type === "path" || row.type === "uuid")) {
                                            $$renderer3.push("<!--[-->");
                                            Copy_button($$renderer3, {
                                              text: row.value,
                                              size: "sm",
                                              variant: "ghost",
                                              class: "h-auto min-h-6 px-2 font-mono text-[11px] text-muted-foreground hover:text-foreground whitespace-normal break-all text-left",
                                              children: ($$renderer4) => {
                                                $$renderer4.push(`<!---->${escape_html(row.value)}`);
                                              },
                                              $$slots: { default: true }
                                            });
                                          } else {
                                            $$renderer3.push("<!--[!-->");
                                            if (row.value && row.type === "datetime") {
                                              $$renderer3.push("<!--[-->");
                                              $$renderer3.push(`<span class="font-mono text-[11px] text-muted-foreground">${escape_html(row.value)}</span>`);
                                            } else {
                                              $$renderer3.push("<!--[!-->");
                                              $$renderer3.push(`${escape_html(row.value)}`);
                                            }
                                            $$renderer3.push(`<!--]-->`);
                                          }
                                          $$renderer3.push(`<!--]-->`);
                                        }
                                        $$renderer3.push(`<!--]--></div></div>`);
                                      }
                                      $$renderer3.push(`<!--]--></div>`);
                                    } else {
                                      $$renderer3.push("<!--[!-->");
                                    }
                                    $$renderer3.push(`<!--]--></div>`);
                                  }
                                  $$renderer3.push(`<!--]-->`);
                                } else {
                                  $$renderer3.push("<!--[!-->");
                                }
                                $$renderer3.push(`<!--]--></div>`);
                              }
                              $$renderer3.push(`<!--]-->`);
                            }
                            $$renderer3.push(`<!--]-->`);
                          }
                          $$renderer3.push(`<!--]-->`);
                        }
                        $$renderer3.push(`<!--]-->`);
                      }
                      $$renderer3.push(`<!--]-->`);
                    }
                    $$renderer3.push(`<!--]-->`);
                  }
                  $$renderer3.push(`<!--]-->`);
                }
                $$renderer3.push(`<!--]-->`);
              }
              $$renderer3.push(`<!--]-->`);
            }
            $$renderer3.push(`<!--]-->`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div>`);
      }
      $$renderer3.push(`<!--]--></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let reportId = "";
    let nodes = [];
    let markers = [];
    $$renderer2.push(`<main class="p-4"><div class="mb-3 flex items-center gap-2"><input class="rv-search max-w-xs" placeholder="Report ID (e.g. 512022712)"${attr("value", reportId)}/> <button class="px-3 py-2 rounded-lg border border-border bg-background text-[13px]">${escape_html("Load")}</button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (nodes.length) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="max-w-5xl">`);
      Report_viewer($$renderer2, { context: "web", nodes, markers });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></main>`);
  });
}
export {
  _page as default
};
