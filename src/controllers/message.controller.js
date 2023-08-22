const Unauthorized = require('../errors/Unauthorized');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const Camping = require('../models/camping');
const HandledError = require('../errors/HandledError');
const conversation = require('../models/conversation');
const messagesCtrl = {};

messagesCtrl.createConversation = async (req, res) => {
  // Crear una nueva conversación con los participantes dados
  const { type, id, camping } = req.body;
  const participants = [{ type, id }];

  if (camping) {
    const CampingObject = await Camping.findById(camping);
    if (!CampingObject.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }
    participants.push({type: 'Camping', id: camping })
  } else {
    participants.push({ 
      type: 'User', 
      id: req.user.role !== 'admin' ? req.user._id : null 
    })
  }

  const prevConversation = await Conversation.findOne({
    $and: participants.map(p => ({ 'participants.id': p.id })),
  })

  if (prevConversation) {
    res.status(200).json(prevConversation);
    return;
  }

  const newConversation = new Conversation({ participants });
  await newConversation.save();

  res.status(201).json(newConversation);
};

messagesCtrl.getConversations = async (req, res, next) => {
  const { type, id, opts } = req.query;
  const { page, size, search, filters = {}, sort } = opts;
  const isAdmin = req.user.role === 'admin';

  try {
    if (type === 'Camping') {
      const CampingObject = await Camping.findById(id);
      if (!CampingObject.owner.equals(req.user._id)) {
        throw new Unauthorized();
      }
    } else if (id !== req.user._id && !isAdmin) {
      throw new Unauthorized();
    }

    filters['participants.id'] = id;

    const conversations = await Conversation.search(
      null, filters, size, page, sort, ['participants.id', 'lastMessage']
    );

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

messagesCtrl.getConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    let conversation = await Conversation.findById(id).populate('participants.id');

    let isParticipant = false;
    for (const p of conversation.participants) {
      if (p.type === 'Camping') {
        const camping = await Camping.findById(p.id);
        if (camping?.owner?.equals(req.user._id)) {
          isParticipant = camping._id;
          break;
        }
      } else if (p?.id?.equals(req.user._id)) {
        isParticipant = p.id;
        break;
      }
    }
    
    if (!isParticipant && !isAdmin) {
      throw new Unauthorized();
    }
    
    const messages = await Message.find({ conversation: id })
      .populate('sender').sort('-createdAt');

    if (conversation.status !== 'pending') {
      conversation.lastMessageSeen.set(isAdmin ? 'admin' : req.user._id, new Date());
      await conversation.save();
    }

    conversation = conversation.toObject();
    conversation.participant = isParticipant || null;

    res.status(200).json({ conversation, messages });
  } catch (error) {
    next(error);
  }
};

messagesCtrl.sendMessage = async (req, res, next) => {
  const sender = req.user._id;
  const { subject, message } = req.body;
  const isAdmin = req.user.role === 'admin';

  try {
    const conversation = await Conversation.findById(req.params.id);
    let isParticipant = false;
    for (const p of conversation.participants) {
      if (p.type === 'Camping') {
        const camping = await Camping.findById(p.id);
        if (camping?.owner?.equals(req.user._id)) {
          isParticipant = true;
          break;
        }
      } else if (p?.id?.equals(req.user._id)) {
        isParticipant = true;
        break;
      }
    }

    if (!isParticipant && !isAdmin) {
      throw new Unauthorized();
    }

    if (conversation.status === 'pending') {
      if (!subject) {
        throw new HandledError('undefined_subject', 'Undefined subject');
      }
      conversation.subject = subject;
    }

    if (!message) {
      throw new HandledError('undefined_message', 'Undefined message');
    }
    const newMessage = new Message({ conversation, sender, message });
    await newMessage.save();

    // Actualizar la conversación con la fecha del último mensaje y del último mensaje visto
    conversation.lastMessage = newMessage._id;
    conversation.status = 'opened';
    conversation.lastMessageSeen.set(isAdmin ? 'admin' : sender, new Date());
    
    await conversation.save();
    await newMessage.populate('sender')
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

module.exports = messagesCtrl;
