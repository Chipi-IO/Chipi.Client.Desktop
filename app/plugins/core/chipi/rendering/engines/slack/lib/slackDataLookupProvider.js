import { chipiUserData } from '../../../../../../../lib/chipi'

const fetchUser = (id) => {
    return chipiUserData.instance.getPersonByRawIdentityId(`${id}`)
}

const currentUserId = 'DummyId'

export default {
    fetchUser,
    currentUserId
}