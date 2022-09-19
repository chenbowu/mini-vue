import { NodeTypes } from '../ast'
import { TO_DISPLAY_STRING, helperMapName } from '../runtimeHelpers'

export function transformInterpolation(node, context) {
  if (node.type === NodeTypes.INTERPOLATION)
    context.helper(helperMapName[TO_DISPLAY_STRING])
}
