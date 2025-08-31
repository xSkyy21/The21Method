import { describe, it, expect, beforeEach, vi } from "vitest"
import { useShoe } from "@/store/useShoe"

// Mock Date.now for consistent testing
const mockNow = vi.fn()
vi.stubGlobal("Date", {
  ...Date,
  now: mockNow,
})

describe("Timeline System", () => {
  beforeEach(() => {
    mockNow.mockReturnValue(1000000) // Fixed timestamp
    useShoe.getState().resetAll()
  })

  it("should prevent event spam with logEventOnce", () => {
    const store = useShoe.getState()

    // Add same event multiple times within window
    store.logEventOnce("test-key", "Test event", 300)
    store.logEventOnce("test-key", "Test event", 300)
    store.logEventOnce("test-key", "Test event", 300)

    // Should only have one event
    expect(store.queue).toHaveLength(1)
    expect(store.queue[0].label).toBe("Test event")
  })

  it("should allow events after time window expires", () => {
    const store = useShoe.getState()

    // First event
    mockNow.mockReturnValue(1000000)
    store.logEventOnce("test-key", "First event", 300)

    // Second event after window expires
    mockNow.mockReturnValue(1000400) // 400ms later
    store.logEventOnce("test-key", "Second event", 300)

    expect(store.queue).toHaveLength(2)
    expect(store.queue[0].label).toBe("First event")
    expect(store.queue[1].label).toBe("Second event")
  })

  it("should maintain FIFO limit of 200 events", () => {
    const store = useShoe.getState()

    // Add 250 events
    for (let i = 0; i < 250; i++) {
      mockNow.mockReturnValue(1000000 + i * 1000) // Different timestamps
      store.addEvent(`Event ${i}`)
    }

    // Should only keep last 200
    expect(store.queue).toHaveLength(200)
    expect(store.queue[0].label).toBe("Event 50") // First 50 should be removed
    expect(store.queue[199].label).toBe("Event 249")
  })

  it("should clean old event keys", () => {
    const store = useShoe.getState()

    // Add many unique events to trigger cleanup
    for (let i = 0; i < 120; i++) {
      mockNow.mockReturnValue(1000000 + i * 1000)
      store.logEventOnce(`key-${i}`, `Event ${i}`, 300)
    }

    // Event keys should be cleaned to prevent memory leak
    expect(store.eventKeys.size).toBeLessThanOrEqual(100)
  })
})
