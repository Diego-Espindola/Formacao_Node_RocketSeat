import { test } from "vitest"
import { Left, left, Right, right, type Either } from "./either.js";

function doSomething(shouldSuccess: boolean): Either<number, string> {
  if(shouldSuccess) {
    return right('success');
  }else{
    return left(10)
  }
}

test('success result', () => {
  const result = doSomething(true)

  if (result.isRight()){
    console.log(result.value)
  }

  expect(result).toBeInstanceOf(Right);
  expect(result.value).toEqual('success');
  expect(result.isRight()).toBe(true);
});

test('error result', () => {
  const result = doSomething(false)

  expect(result).toBeInstanceOf(Left);
  expect(result.value).toEqual(10);
  expect(result.isLeft()).toBe(true);
});