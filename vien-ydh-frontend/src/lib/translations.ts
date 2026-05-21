/**
 * @file translations.ts
 * @description Utility functions to translate dynamic database content (services, specialties, genders) to EN/ZH on the client-side.
 */

export function translateServiceName(name: string, locale: string): string {
  if (!name) return "";
  const cleanLocale = locale.toLowerCase();
  
  if (cleanLocale === "vi") return name;

  const normalized = name.trim();

  const map: Record<string, { en: string; zh: string }> = {
    "Khám Phụ khoa": {
      en: "Gynecological Examination",
      zh: "妇科检查",
    },
    "Khám Dinh dưỡng": {
      en: "Nutrition Examination",
      zh: "营养科检查",
    },
    "Khám Phục hồi chức năng": {
      en: "Rehabilitation Examination",
      zh: "康复科检查",
    },
    "Khám Y học cổ truyền": {
      en: "Traditional Medicine Examination",
      zh: "中医科检查",
    },
    // Fallbacks just in case there are mock values or other values
    "Khám bệnh Y học cổ truyền": {
      en: "Traditional Medicine Consultation",
      zh: "中医普通门诊",
    },
    "Khám chuyên gia Đông Y": {
      en: "Traditional Medicine Specialist Consultation",
      zh: "中医专家门诊",
    },
    "Khám theo Yêu cầu": {
      en: "Requested Consultation",
      zh: "特需门诊",
    }
  };

  const match = map[normalized];
  if (match) {
    return cleanLocale === "zh" ? match.zh : match.en;
  }

  // Exact matching case-insensitive as fallback
  for (const key of Object.keys(map)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return cleanLocale === "zh" ? map[key].zh : map[key].en;
    }
  }

  return name;
}

export function translateSpecialtyName(name: string, locale: string): string {
  if (!name) return "";
  const cleanLocale = locale.toLowerCase();
  
  if (cleanLocale === "vi") return name;

  const normalized = name.trim();

  const map: Record<string, { en: string; zh: string }> = {
    "Chuyên khoa Nội": {
      en: "Internal Medicine",
      zh: "内科",
    },
    "Chuyên khoa Ngoại": {
      en: "Surgery Department",
      zh: "外科",
    },
    "Chuyên khoa Nhi": {
      en: "Pediatrics Department",
      zh: "儿科",
    },
    "Chuyên khoa sản": {
      en: "Obstetrics & Gynecology",
      zh: "妇产科",
    },
    "Chuyên khoa Sản": {
      en: "Obstetrics & Gynecology",
      zh: "妇产科",
    }
  };

  const match = map[normalized];
  if (match) {
    return cleanLocale === "zh" ? match.zh : match.en;
  }

  // Case-insensitive match fallback
  for (const key of Object.keys(map)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return cleanLocale === "zh" ? map[key].zh : map[key].en;
    }
  }

  return name;
}

export function translateGender(gender: string, locale: string): string {
  if (!gender) return "";
  const cleanLocale = locale.toLowerCase();
  if (cleanLocale === "vi") return gender;

  const normalized = gender.trim().toUpperCase();
  if (normalized === "NAM" || normalized === "MALE" || normalized === "M") {
    return cleanLocale === "zh" ? "男" : "Male";
  }
  if (normalized === "NỮ" || normalized === "NU" || normalized === "FEMALE" || normalized === "F") {
    return cleanLocale === "zh" ? "女" : "Female";
  }
  return gender;
}
