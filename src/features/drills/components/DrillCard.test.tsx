import { render, screen } from "@testing-library/react";
import { DrillCard } from "./DrillCard";
import { Drill } from "../types";

const mockDrill: Drill = {
  id: "1",
  title: "Test Drill Title",
  thumbnail: { url: "/test-image.jpg" },
  pdf: "test.pdf",
  tags: ["math", "grade1"],
};

describe("DrillCard", () => {
  it("renders drill information correctly", () => {
    render(<DrillCard drill={mockDrill} />);

    // Check title
    expect(screen.getByText("Test Drill Title")).toBeInTheDocument();

    // Check tags
    expect(screen.getByText("math")).toBeInTheDocument();
    expect(screen.getByText("grade1")).toBeInTheDocument();

    // Check image (alt text)
    expect(screen.getByAltText("Test Drill Title")).toBeInTheDocument();
  });

  it("links to the correct drill detail page", () => {
    render(<DrillCard drill={mockDrill} />);

    // Check link href
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/drills/1");
  });
});
