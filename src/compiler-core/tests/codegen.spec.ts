import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'
import { transformElement } from '../src/transforms/transformElement'
import { transformExpression } from '../src/transforms/transformExpression'
import { transformInterpolation } from '../src/transforms/transformInterpolation'
import { transformText } from '../src/transforms/transformText'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      nodeTransforms: [transformInterpolation, transformExpression],
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast = baseParse('<div>hi,{{message}}{{count}}</div>')
    transform(ast, {
      nodeTransforms: [transformExpression, transformInterpolation, transformElement, transformText],
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
