module.exports.generateScheduleCombinations = function(formattedData) {
  const combinationResults = [];
  const courseCodeKeys = Object.keys(formattedData);
  const courseCodeKeysLength = courseCodeKeys.length;
  function helper(array, i) {
    const indexKeys = Object.keys(formattedData[courseCodeKeys[i]]);
    for (let j = 0; j < indexKeys.length; j++) {
      // copy array
      const result = array.slice(0);
      result.push({
        index: indexKeys[j],
        ...formattedData[courseCodeKeys[i]][indexKeys[j]],
      });
      if (i != courseCodeKeysLength - 1) {
        // not at last coursecode
        helper(result, i + 1);
      } else {
        combinationResults.push({
          id: createId(result, courseCodeKeysLength),
          data: result,
          freeDays: combineFreeDays(result, courseCodeKeysLength),
        });
      }
    }
  }
  helper([], 0);
  return combinationResults;
};

function createId(result, courseCodeKeysLength) {
  let id ="";
  for (let i=0; i<courseCodeKeysLength; i++) {
    id += result[i].index;
  }
  return id;
}

function combineFreeDays(result, courseCodeKeysLength) {
  let freeDays = [...result[0].freeDays];
  for (let i=1; i< courseCodeKeysLength; i++) {
    const currentFreeDays = result[i].freeDays;
    freeDays = freeDays.filter((val) => currentFreeDays.includes(val));
  }
  return freeDays;
}