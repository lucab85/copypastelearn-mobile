import { tokenCache } from "../tokenCache";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("tokenCache", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getToken returns stored value", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("test-token");
    const result = await tokenCache.getToken("key");
    expect(result).toBe("test-token");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("key");
  });

  it("getToken returns null on error", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error("fail"));
    const result = await tokenCache.getToken("key");
    expect(result).toBeNull();
  });

  it("saveToken stores value", async () => {
    await tokenCache.saveToken("key", "value");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("key", "value");
  });

  it("clearToken deletes value", async () => {
    await tokenCache.clearToken!("key");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("key");
  });
});
