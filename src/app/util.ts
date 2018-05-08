

export async function filterParams(params: any) {
  let param;
  for (param in params) {
    if (parseInt(params[param]).toString() === params[param]) {
      params[param] = parseInt(params[param]);
    }
  }
}
