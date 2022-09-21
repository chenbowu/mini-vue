// mini-vue 出口
import { baseCompile } from './compiler-core/src'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'

export * from './reactivity'
export * from './runtime-dom'

function compileToFunction(template) {
  const { code } = baseCompile(template)
  // eslint-disable-next-line no-new-func
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

registerRuntimeCompiler(compileToFunction)
