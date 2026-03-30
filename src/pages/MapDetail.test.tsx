/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MapDetail from "./MapDetail";
import { describe, it, beforeEach, expect, jest } from "@jest/globals";

const mockUseParams = jest.fn();
const mockNavigate = jest.fn();
const mockUseAuth = jest.fn();
const mockUseMaps = jest.fn();
const mockUseUserFavorites = jest.fn();
const mockUseToggleFavorite = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/hooks/useMaps", () => ({
  useMaps: () => mockUseMaps(),
}));

jest.mock("@/hooks/useGrenadeThrows", () => ({
  useUserFavorites: () => mockUseUserFavorites(),
  useToggleFavorite: () => mockUseToggleFavorite(),
}));

jest.mock("@/integrations/supabase/client", () => ({
  supabase: {},
}));

describe("MapDetail Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ mapName: "testMap" });
    mockUseAuth.mockReturnValue({ user: null });
    mockUseMaps.mockReturnValue({
      data: [
        {
          name: "testMap",
          display_name: "Test Map",
          image_url: "http://example.com/testmap.png",
          throws: [],
        },
      ],
      refetch: jest.fn(),
    });
    mockUseUserFavorites.mockReturnValue({ data: [] });
    mockUseToggleFavorite.mockReturnValue({ mutate: jest.fn() });
  });

  it("should render the map name correctly", () => {
    render(<MapDetail />);
    expect(screen.getByText(/Test Map/i)).toBeInTheDocument();
  });

  it('should navigate back when the "Назад" button is clicked', () => {
    render(<MapDetail />);
    const backButton = screen.getByRole("button", {
      name: /Назад|РќР°Р·Р°Рґ/i,
    });
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Add more tests for other functionalities as needed
});
