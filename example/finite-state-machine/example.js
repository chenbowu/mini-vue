// obtain /abc/

function machine(str) {
  let currentState
  let i
  let startIndex
  let endIndex
  const result = []
  function waitForA(char) {
    if (char === 'a') {
      startIndex = i
      return waitForB
    }

    return waitForA
  }

  function waitForB(char) {
    if (char === 'b')
      return waitForC

    return waitForA
  }

  function waitForC(char) {
    if (char === 'c' || char === 'd') {
      endIndex = i
      return end
    }

    return waitForA
  }

  function end() {
    return end
  }

  currentState = waitForA
  for (i = 0; i < str.length; i++) {
    const nextState = currentState(str[i])
    currentState = nextState
    if (currentState === end) {
      currentState = waitForA
      result.push({
        start: startIndex,
        end: endIndex,
      })
    }
  }
  return result
}
console.log(machine('sabcfsabdkld'))
