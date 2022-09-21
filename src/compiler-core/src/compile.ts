import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformExpression } from './transforms/transformExpression'
import { transformInterpolation } from './transforms/transformInterpolation'
import { transformText } from './transforms/transformText'

export function baseCompile(template) {
  const ast = baseParse(template)
  transform(ast, {
    nodeTransforms: [transformExpression, transformInterpolation, transformElement, transformText],
  })

  return generate(ast)
}
