import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function write(rel, s) {
  fs.writeFileSync(join(root, rel), s, 'utf8')
  console.log('OK', rel)
}

// ---------- App.vue ----------
{
  let s = fs.readFileSync(join(root, 'src/App.vue'), 'utf8')
  s = s.replace(
    /<p class="subtitle">[^<]*<\/p>/,
    '<p class="subtitle">\u5b89\u5168\u767b\u5f55\u4e0e\u6ce8\u518c \u00b7 \u6a21\u5757\u5316\u524d\u7aef</p>',
  )
  s = s.replace(
    /<nav v-if="page !== 'reset'" class="segmented" aria-label="[^"]*">[\s\S]*?<\/nav>/,
    `<nav v-if="page !== 'reset'" class="segmented" aria-label="\u767b\u5f55\u6216\u6ce8\u518c">
          <button
            type="button"
            class="seg-btn"
            :class="{ active: page === 'login' }"
            @click="page = 'login'"
          >
            \u767b\u5f55
          </button>
          <button
            type="button"
            class="seg-btn"
            :class="{ active: page === 'register' }"
            @click="page = 'register'"
          >
            \u6ce8\u518c
          </button>
        </nav>`,
  )
  s = s.replace(
    /<button type="button" class="back-btn" @click="page = 'login'">[^<]*<\/button>/,
    '<button type="button" class="back-btn" @click="page = \'login\'">\u2190 \u8fd4\u56de\u767b\u5f55</button>',
  )
  s = s.replace(/<span>[^<]*API[^<]*<\/span>/, '<span>\u540e\u7aef API\uff1a</span>')
  s = s.replace(
    /function handleRegistered\(\) \{\s*page\.value = 'login'\s*loginNotice\.value = '[^']*'/,
    "function handleRegistered() {\n  page.value = 'login'\n  loginNotice.value = '\u6ce8\u518c\u6210\u529f\uff0c\u5df2\u8df3\u8f6c\u767b\u5f55'",
  )
  s = s.replace(
    /function handleResetDone\(\) \{\s*page\.value = 'login'\s*loginNotice\.value = '[^']*'/,
    "function handleResetDone() {\n  page.value = 'login'\n  loginNotice.value = '\u5bc6\u7801\u91cd\u7f6e\u6210\u529f\uff0c\u8bf7\u4f7f\u7528\u65b0\u5bc6\u7801\u767b\u5f55'",
  )
  write('src/App.vue', s)
}

// ---------- LoginForm.vue ----------
{
  let s = fs.readFileSync(join(root, 'src/modules/auth/components/LoginForm.vue'), 'utf8')
  s = s.replace(
    /<p class="hint">[^<]*<code>POST \/user\/login<\/code><\/p>/,
    '<p class="hint">\u4f7f\u7528 JSON \u8bf7\u6c42 <code>POST /user/login</code></p>',
  )
  let n = 0
  s = s.replace(/<span class="label">\?+<\/span>/g, () => {
    n += 1
    return n === 1
      ? '<span class="label">\u7528\u6237</span>'
      : '<span class="label">\u5bc6\u7801</span>'
  })
  s = s.replace(
    /placeholder="\?+\/\?+\/\?+"/,
    'placeholder="\u7528\u6237\u540d/\u90ae\u7bb1/\u624b\u673a\u53f7"',
  )
  s = s.replace(
    /placeholder="\?{6,}"/,
    'placeholder="\u542b\u5927\u5c0f\u5199\u3001\u6570\u5b57\u4e0e\u7279\u6b8a\u5b57\u7b26"',
  )
  s = s.replace(
    /\{\{ loading \? '\?+' : '\?+' \}\}/,
    "{{ loading ? '\u767b\u5f55\u4e2d\u2026' : '\u767b\u5f55' }}",
  )
  s = s.replace(
    /<button type="button" class="assist-btn" @click="emit\('forgot-password'\)">\?+<\/button>/,
    '<button type="button" class="assist-btn" @click="emit(\'forgot-password\')">\u5fd8\u8bb0\u5bc6\u7801</button>',
  )
  s = s.replace(
    /if \(!value\) return \{ ok: false, message: '[^']*' \}/,
    "if (!value) return { ok: false, message: '\u8bf7\u8f93\u5165\u7528\u6237\uff08\u7528\u6237\u540d/\u90ae\u7bb1/\u624b\u673a\u53f7\uff09' }",
  )
  s = s.replace(
    /if \(\/\^\\d\+\$\/\.test\(value\)\) return \{ ok: false, message: '[^']*' \}/,
    "if (/^\\d+$/.test(value)) return { ok: false, message: '\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e' }",
  )
  s = s.replace(
    /banner\.value = '[^']*'\n    bannerType\.value = 'warn'\n    return/,
    "banner.value = '\u8bf7\u4fee\u6b63\u8868\u5355\u9519\u8bef\u540e\u518d\u8bd5'\n    bannerType.value = 'warn'\n    return",
  )
  s = s.replace(
    /getApiMessage\(data, '[^']*'\)\n      bannerType\.value = 'ok'/,
    "getApiMessage(data, '\u767b\u5f55\u6210\u529f')\n      bannerType.value = 'ok'",
  )
  s = s.replace(
    /const msg = getApiMessage\(data, `[^`]*`\)/,
    'const msg = getApiMessage(data, `\u767b\u5f55\u5931\u8d25\uff08${res.status}\uff09`)',
  )
  s = s.replace(
    /const msg = e instanceof Error \? e\.message : '[^']*'/,
    "const msg = e instanceof Error ? e.message : '\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'",
  )
  s = s.replace(/banner\.value = '\?{10}'/, "banner.value = '\u8bf7\u4fee\u6b63\u8868\u5355\u9519\u8bef\u540e\u518d\u8bd5'")
  s = s.replace(
    /getApiMessage\(data, '\?{4}'\)(?=\n      bannerType\.value = 'ok')/,
    "getApiMessage(data, '\u767b\u5f55\u6210\u529f')",
  )
  write('src/modules/auth/components/LoginForm.vue', s)
}

// ---------- SmsLoginFab.vue ----------
{
  let s = fs.readFileSync(join(root, 'src/modules/auth/components/SmsLoginFab.vue'), 'utf8')
  s = s.replace(/aria-label="\?+"/, 'aria-label="\u624b\u673a\u53f7\u9a8c\u8bc1\u7801\u767b\u5f55"')
  s = s.replace(
    /<span v-if="!inline" class="fab-icon" aria-hidden="true">\?+<\/span>\s*<span class="fab-text">\?+<\/span>/,
    '<span v-if="!inline" class="fab-icon" aria-hidden="true">\ud83d\udcf1</span>\n    <span class="fab-text">\u9a8c\u8bc1\u7801\u767b\u5f55</span>',
  )
  s = s.replace(
    /<h2 class="drawer-title">\?+ \+ \?+<\/h2>\s*<button type="button" class="icon-btn" aria-label="\?+" @click="close">\?<\/button>/,
    '<h2 class="drawer-title">\u624b\u673a\u53f7 + \u9a8c\u8bc1\u7801</h2>\n            <button type="button" class="icon-btn" aria-label="\u5173\u95ed" @click="close">\u00d7</button>',
  )
  s = s.replace(
    /<p class="drawer-desc">[^<]*<code>POST \/user\/login<\/code>[^<]*<\/p>/,
    '<p class="drawer-desc">\u4f7f\u7528 JSON \u8bf7\u6c42 <code>POST /user/login</code>\uff0c\u8f7d\u8377\u4e3a <code>phone</code> + <code>code</code>\u3002</p>',
  )
  s = s.replace(
    /<p class="drawer-desc">\?\? JSON[\s\S]*?<\/p>/,
    '<p class="drawer-desc">\u4f7f\u7528 JSON \u8bf7\u6c42 <code>POST /user/login</code>\uff0c\u8f7d\u8377\u4e3a <code>phone</code> + <code>code</code>\u3002</p>',
  )
  s = s.replace(
    /<span class="label">\?+<\/span>\s*<input[^>]*v-model="phone"/,
    '<span class="label">\u624b\u673a\u53f7</span>\n            <input\n              v-model="phone"',
  )
  s = s.replace(
    /placeholder="11 \?+"/,
    'placeholder="11 \u4f4d\u624b\u673a\u53f7"',
  )
  s = s.replace(
    /<span class="label">\?+<\/span>\s*<div class="row">/,
    '<span class="label">\u9a8c\u8bc1\u7801</span>\n            <div class="row">',
  )
  s = s.replace(/placeholder="\?+"/, 'placeholder="\u8f93\u5165\u9a8c\u8bc1\u7801"')
  s = s.replace(
    /\{\{ countdown > 0 \? `\$\{countdown\}s` : sending \? '\?+' : '\?+' \}\}/,
    "{{ countdown > 0 ? `${countdown}s` : sending ? '\u53d1\u9001\u4e2d\u2026' : '\u83b7\u53d6\u9a8c\u8bc1\u7801' }}",
  )
  s = s.replace(
    /\{\{ loading \? '\?+' : '\?+' \}\}/,
    "{{ loading ? '\u767b\u5f55\u4e2d\u2026' : '\u767b\u5f55' }}",
  )
  s = s.replace(/banner\.value = '\?+'\n      bannerType\.value = 'ok'/, "banner.value = '\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001'\n      bannerType.value = 'ok'")
  s = s.replace(
    /getApiMessage\(data, '\?+'\)/,
    "getApiMessage(data, '\u53d1\u9001\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5')",
  )
  s = s.replace(
    /const msg = e instanceof Error \? e\.message : '\?+'/,
    "const msg = e instanceof Error ? e.message : '\u7f51\u7edc\u5f02\u5e38'",
  )
  s = s.replace(
    /banner\.value = '\?+'\n    bannerType\.value = 'warn'\n    return/,
    "banner.value = '\u8bf7\u8f93\u5165\u624b\u673a\u53f7\u548c\u9a8c\u8bc1\u7801'\n    bannerType.value = 'warn'\n    return",
  )
  s = s.replace(
    /getApiMessage\(data, '\?+'\)\n      bannerType\.value = 'ok'/,
    "getApiMessage(data, '\u767b\u5f55\u6210\u529f')\n      bannerType.value = 'ok'",
  )
  s = s.replace(
    /const msg = getApiMessage\(data, `[^`]*`\)\n      banner\.value = msg\n      bannerType\.value = 'warn'/,
    'const msg = getApiMessage(data, `\u767b\u5f55\u5931\u8d25\uff08${res.status}\uff09`)\n      banner.value = msg\n      bannerType.value = \'warn\'',
  )
  s = s.replace(
    /const msg = e instanceof Error \? e\.message : '\?+'\n    banner\.value = msg\n    bannerType\.value = 'warn'/,
    "const msg = e instanceof Error ? e.message : '\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'\n    banner.value = msg\n    bannerType.value = 'warn'",
  )
  s = s.replace(/banner\.value = '\?{6}'/, "banner.value = '\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001'")
  s = s.replace(
    /banner\.value = '\?{10}'(?=\n    bannerType\.value = 'warn'\n    return)/,
    "banner.value = '\u8bf7\u8f93\u5165\u624b\u673a\u53f7\u548c\u9a8c\u8bc1\u7801'",
  )
  s = s.replace(
    /getApiMessage\(data, '\?{4}'\)(?=\n      bannerType\.value = 'ok')/,
    "getApiMessage(data, '\u767b\u5f55\u6210\u529f')",
  )
  write('src/modules/auth/components/SmsLoginFab.vue', s)
}

// ---------- ResetPasswordForm.vue ----------
{
  let s = fs.readFileSync(join(root, 'src/modules/auth/components/ResetPasswordForm.vue'), 'utf8')
  s = s.replace(
    /<p class="hint">[\s\S]*?<\/p>/,
    `<p class="hint">
      \u91cd\u7f6e\u5bc6\u7801\u5c06\u8c03\u7528 <code>POST /user/resetPw</code>\uff0c\u8d26\u53f7\u6846\u652f\u6301\u7528\u6237\u540d/\u90ae\u7bb1/\u624b\u673a\u53f7\u81ea\u52a8\u8bc6\u522b\u3002
    </p>`,
  )
  let ln = 0
  s = s.replace(/<span class="label">\?+<\/span>/g, () => {
    ln += 1
    if (ln === 1) return '<span class="label">\u7528\u6237</span>'
    if (ln === 2) return '<span class="label">\u5bc6\u7801</span>'
    return '<span class="label">\u786e\u8ba4\u5bc6\u7801</span>'
  })
  s = s.replace(
    /placeholder="\?+ \/ \?+ \/ \?+"/,
    'placeholder="\u7528\u6237\u540d / \u90ae\u7bb1 / \u624b\u673a\u53f7"',
  )
  s = s.replace(
    /placeholder="\?{6,}"/g,
    (m, off, full) => {
      const before = full.slice(0, off)
      if (before.includes('v-model="password2"')) return 'placeholder="\u518d\u6b21\u8f93\u5165\u5bc6\u7801"'
      return 'placeholder="\u542b\u5927\u5c0f\u5199\u3001\u6570\u5b57\u4e0e\u7279\u6b8a\u5b57\u7b26"'
    },
  )
  s = s.replace(
    /\{\{ loading \? '\?+' : '\?+' \}\}/,
    "{{ loading ? '\u63d0\u4ea4\u4e2d\u2026' : '\u91cd\u7f6e\u5bc6\u7801' }}",
  )
  s = s.replace(
    /if \(!value\) return \{ ok: false, message: '[^']*' \}/,
    "if (!value) return { ok: false, message: '\u8bf7\u8f93\u5165\u7528\u6237\uff08\u7528\u6237\u540d/\u90ae\u7bb1/\u624b\u673a\u53f7\uff09' }",
  )
  s = s.replace(
    /return \{ ok: false, message: '\?+' \}/,
    "return { ok: false, message: '\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e' }",
  )
  s = s.replace(
    /if \(!password2\.value\) return '\?+'/,
    "if (!password2.value) return '\u8bf7\u518d\u6b21\u8f93\u5165\u5bc6\u7801'",
  )
  s = s.replace(
    /if \(password2\.value !== password\.value\) return '\?+'/,
    "if (password2.value !== password.value) return '\u4e24\u6b21\u5bc6\u7801\u4e0d\u4e00\u81f4'",
  )
  s = s.replace(
    /banner\.value = '\?+'\n    bannerType\.value = 'warn'\n    return/,
    "banner.value = '\u8bf7\u4fee\u6b63\u8868\u5355\u9519\u8bef\u540e\u518d\u8bd5'\n    bannerType.value = 'warn'\n    return",
  )
  s = s.replace(
    /getApiMessage\(data, '\?+'\)\n      bannerType\.value = 'ok'/,
    "getApiMessage(data, '\u5bc6\u7801\u91cd\u7f6e\u6210\u529f')\n      bannerType.value = 'ok'",
  )
  s = s.replace(
    /banner\.value = getApiMessage\(data, `[^`]*`\)/,
    'banner.value = getApiMessage(data, `\u91cd\u7f6e\u5931\u8d25\uff08${res.status}\uff09`)',
  )
  s = s.replace(
    /banner\.value = e instanceof Error \? e\.message : '\?+'/,
    "banner.value = e instanceof Error ? e.message : '\u7f51\u7edc\u5f02\u5e38\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'",
  )
  write('src/modules/auth/components/ResetPasswordForm.vue', s)
}

console.log('Done.')
