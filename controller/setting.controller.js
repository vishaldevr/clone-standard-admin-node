import SettingModal from '../model/setting.model.js';
import sendEmail from '../utils/sendMail.js';

export const getFirstSetting = async (req, res) => {
  try {
    const setting = await SettingModal.findOne();
    res.status(200).json(setting);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSetting = async (req, res) => {
  const { id } = req.params;
  try {
    const setting = await SettingModal.findById(id);
    res.status(200).json(setting);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createOrUpdateSetting = async (req, res) => {
  try {
    let reqData = req.body;

    if (req.files) {
      if (req.files.logo && reqData.logo !== null) {
        reqData = { ...reqData, logo: req.files.logo[0].path };
      } else {
        delete reqData.logo;
      }

      if (req.files.background && reqData.background !== '') {
        reqData = { ...reqData, background: req.files.background[0].path };
      } else {
        delete reqData.background;
      }
    }

    const id = reqData.id || reqData._id;

    if (id) {
      const settingModel = { ...reqData, _id: id };
      const setting = await SettingModal.findByIdAndUpdate(id, settingModel, {
        new: true,
      });
      res.json(setting);
    } else {
      const settingModel = new SettingModal({
        ...reqData,
        created_at: new Date().toISOString(),
      });
      await settingModel.save();
      res.json(settingModel);
    }
  } catch (error) {
    console.error('Error in createOrUpdateSetting:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const sendTestMail = async (req, res) => {
  const { email, id } = req.body;
  try {
    const mailOptions = {
      // eslint-disable-next-line no-undef
      from: process.env.USER_EMAIL,
      to: email,
      subject: 'Test Email',
      text: 'Dear User,\n\nYou have sent to Test .',
      html: `
              <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                  <h1>Test Email</h1>
                  <p>Your Application Team</p>
              </div>
          `,
    };

    await sendEmail(mailOptions, id);
    res.status(201).json({ message: 'Test mail send successfully.' });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
