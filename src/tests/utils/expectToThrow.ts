export default async function expectToThrow(
  fn: () => Promise<any>,
  expectedError?: any
) {
  await expect(fn).rejects.toThrow(expectedError);
}
