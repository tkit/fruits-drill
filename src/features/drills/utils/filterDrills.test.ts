import { Drill } from "../types";
import { filterDrills, calculateDisabledTags, getAllTags } from "./filterDrills";

const mockDrills: Drill[] = [
  {
    id: "1",
    title: "Drill 1",
    thumbnail: { url: "img1.jpg" },
    pdf: "drill1.pdf",
    tags: ["tag1", "tag2"],
  },
  {
    id: "2",
    title: "Drill 2",
    thumbnail: { url: "img2.jpg" },
    pdf: "drill2.pdf",
    tags: ["tag2", "tag3"],
  },
  {
    id: "3",
    title: "Drill 3",
    thumbnail: { url: "img3.jpg" },
    pdf: "drill3.pdf",
    tags: ["tag1"],
  },
];

describe("filterDrills utils", () => {
  describe("getAllTags", () => {
    it("should return distinct sorted tags", () => {
      const tags = getAllTags(mockDrills);
      expect(tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should return empty array if no drills", () => {
      const tags = getAllTags([]);
      expect(tags).toEqual([]);
    });
  });

  describe("filterDrills", () => {
    it("should return all drills if no tags selected", () => {
      const result = filterDrills(mockDrills, []);
      expect(result).toEqual(mockDrills);
    });

    it("should filter drills by single tag", () => {
      const result = filterDrills(mockDrills, ["tag1"]);
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toEqual(expect.arrayContaining(["1", "3"]));
    });

    it("should filter drills by multiple tags (AND condition)", () => {
      const result = filterDrills(mockDrills, ["tag1", "tag2"]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should return empty array if no matches", () => {
      const result = filterDrills(mockDrills, ["tag1", "tag3"]);
      expect(result).toHaveLength(0);
    });
  });

  describe("calculateDisabledTags", () => {
    it("should return tags that result in zero matches", () => {
      // selecting tag1.
      // drill 1 has tag1, tag2.
      // drill 3 has tag1.
      // if we add tag3, checks:
      // drill 1: has tag1, tag2. Missing tag3.
      // drill 3: has tag1. Missing tag3.
      // so tag3 should be disabled if tag1 is selected, because tag1 AND tag3 matches nothing.
      const allTags = ["tag1", "tag2", "tag3"];
      const disabled = calculateDisabledTags(mockDrills, ["tag1"], allTags);
      expect(disabled).toContain("tag3");
      expect(disabled).not.toContain("tag2"); // tag1 + tag2 exists (drill 1)
    });

    it("should not disable selected tags", () => {
      const allTags = ["tag1", "tag2", "tag3"];
      // if tag1 is selected, it shouldn't be disabled
      const disabled = calculateDisabledTags(mockDrills, ["tag1"], allTags);
      expect(disabled).not.toContain("tag1");
    });
  });
});
