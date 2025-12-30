import { render, screen } from "@testing-library/react";
import Home from "./page";
import { getDrills } from "@/features/drills/api/getDrills";

// Mock the getDrills API
jest.mock("@/features/drills/api/getDrills", () => ({
  getDrills: jest.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a heading", async () => {
    (getDrills as jest.Mock).mockResolvedValue([
      {
        id: "1",
        title: "Test Drill",
        description: "Test Description",
        category: "Test Category",
        tags: ["tag1"],
        thumbnail: {
          url: "https://example.com/thumbnail.jpg",
          height: 100,
          width: 100,
        },
      },
    ]);

    const searchParams = Promise.resolve({});
    const ui = await Home({ searchParams });
    render(ui);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();

    // Should show drill
    expect(screen.getByText("Test Drill")).toBeInTheDocument();
  });

  it("displays message when no drills found", async () => {
    (getDrills as jest.Mock).mockResolvedValue([]); // Empty drills

    const searchParams = Promise.resolve({});
    const ui = await Home({ searchParams });
    render(ui);

    expect(screen.getByText("条件に一致するドリルは見つかりませんでした。")).toBeInTheDocument();
  });

  it("filters drills based on tags", async () => {
    (getDrills as jest.Mock).mockResolvedValue([
      {
        id: "1",
        title: "Math Drill",
        thumbnail: { url: "/img1.jpg" },
        tags: ["math"],
        pdf: "1.pdf",
      },
      {
        id: "2",
        title: "Kanji Drill",
        thumbnail: { url: "/img2.jpg" },
        tags: ["kanji"],
        pdf: "2.pdf",
      },
    ]);

    // url has ?tags=math
    const searchParams = Promise.resolve({ tags: "math" });
    const ui = await Home({ searchParams });
    render(ui);

    expect(screen.getByText("Math Drill")).toBeInTheDocument();
    expect(screen.queryByText("Kanji Drill")).not.toBeInTheDocument();
  });
});
