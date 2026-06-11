const prisma = require("../../libs/prisma");

const getSettings = async () => {
  const settingsList = await prisma.globalSetting.findMany();
  const settingsObj = {};
  settingsList.forEach(item => {
    settingsObj[item.key] = item.value;
  });
  return settingsObj;
};

const updateSettings = async (settingsObj) => {
  return await prisma.$transaction(
    Object.entries(settingsObj).map(([key, value]) =>
      prisma.globalSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );
};

module.exports = {
  getSettings,
  updateSettings,
};
