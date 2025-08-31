import { describe, it, expect } from "vitest"
import { mulberry32, hash32, sha256, generateSeed } from "@/lib/crypto"

describe("Crypto Functions", () => {
  describe("mulberry32", () => {
    it("should generate consistent random numbers with same seed", () => {
      const rng1 = mulberry32(12345)
      const rng2 = mulberry32(12345)

      const values1 = Array.from({ length: 10 }, () => rng1())
      const values2 = Array.from({ length: 10 }, () => rng2())

      expect(values1).toEqual(values2)
    })

    it("should generate different sequences with different seeds", () => {
      const rng1 = mulberry32(12345)
      const rng2 = mulberry32(54321)

      const values1 = Array.from({ length: 10 }, () => rng1())
      const values2 = Array.from({ length: 10 }, () => rng2())

      expect(values1).not.toEqual(values2)
    })

    it("should generate numbers between 0 and 1", () => {
      const rng = mulberry32(12345)
      const values = Array.from({ length: 100 }, () => rng())

      values.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      })
    })
  })

  describe("hash32", () => {
    it("should generate consistent hash for same input", () => {
      const input = "test-string"
      const hash1 = hash32(input)
      const hash2 = hash32(input)

      expect(hash1).toBe(hash2)
      expect(typeof hash1).toBe("number")
    })

    it("should generate different hashes for different inputs", () => {
      const hash1 = hash32("input1")
      const hash2 = hash32("input2")

      expect(hash1).not.toBe(hash2)
    })

    it("should always return positive numbers", () => {
      const inputs = ["test1", "test2", "test3", "negative-test", ""]

      inputs.forEach((input) => {
        const hash = hash32(input)
        expect(hash).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe("sha256", () => {
    it("should generate consistent SHA-256 hash", async () => {
      const input = "test message"
      const hash1 = await sha256(input)
      const hash2 = await sha256(input)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 produces 64 character hex string
      expect(hash1).toMatch(/^[a-f0-9]{64}$/)
    })

    it("should generate different hashes for different inputs", async () => {
      const hash1 = await sha256("message1")
      const hash2 = await sha256("message2")

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("generateSeed", () => {
    it("should generate seeds of correct length", () => {
      const seed = generateSeed()
      expect(seed).toHaveLength(16)
    })

    it("should generate different seeds each time", () => {
      const seed1 = generateSeed()
      const seed2 = generateSeed()

      expect(seed1).not.toBe(seed2)
    })

    it("should only contain valid characters", () => {
      const seed = generateSeed()
      expect(seed).toMatch(/^[A-Za-z0-9]{16}$/)
    })
  })
})
