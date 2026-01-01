import { render, screen } from "@testing-library/react";
import { TagFilter } from "./TagFilter";

describe("TagFilter", () => {
  const allTags = ["tag1", "tag2", "tag3"];

  it("renders all tags", () => {
    render(<TagFilter allTags={allTags} selectedTags={[]} disabledTags={[]} />);

    allTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(screen.getByText("すべて")).toBeInTheDocument();
  });

  it("highlights selected tags", () => {
    render(<TagFilter allTags={allTags} selectedTags={["tag1"]} disabledTags={[]} />);

    // "tag1" should have active styles (defaults to amber-500 for non-subject tags)
    const tag1 = screen.getByText("tag1");
    expect(tag1).toHaveClass("bg-amber-500");

    // "tag2" should have inactive styles
    const tag2 = screen.getByText("tag2");
    expect(tag2).toHaveClass("bg-white");
  });

  it("disables tags correctly", () => {
    render(<TagFilter allTags={allTags} selectedTags={["tag1"]} disabledTags={["tag2"]} />);

    const tag2 = screen.getByText("tag2");
    expect(tag2).toHaveClass("cursor-not-allowed");
    // Should be a span, not a link (assuming implementation renders span for disabled)
    expect(tag2.tagName).toBe("SPAN");
  });

  it("generates correct toggle links", () => {
    render(<TagFilter allTags={allTags} selectedTags={["tag1"]} disabledTags={[]} />);

    // Clicking "tag2" (unselected) should add it -> "?tags=tag1,tag2"
    const tag2Link = screen.getByText("tag2").closest("a");
    expect(tag2Link).toHaveAttribute("href", "/?tags=tag1%2Ctag2");

    // Clicking "tag1" (selected) should remove it -> "/"
    const tag1Link = screen.getByText("tag1").closest("a");
    expect(tag1Link).toHaveAttribute("href", "/");
  });
});
