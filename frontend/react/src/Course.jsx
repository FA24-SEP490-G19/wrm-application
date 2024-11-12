import {Button, ButtonGroup, Card, CardBody, CardFooter, Divider, Heading, Image, Stack, Text} from "@chakra-ui/react";


const Course = () => {
    return (
        <Card maxW='sm'>
            <CardBody>
                <Image
                    src='https://daotaovieclam.edu.vn/upload/images/tieng-nhat.jpg'
                    alt='Green double couch with wooden legs'
                    borderRadius='lg'
                />
                <Stack mt='6' spacing='3'>
                    <Heading size='md'>Khóa học Minano Nihongo sơ cấp 1</Heading>
                    <Text>
                        Khóa học cho người mới bắt đầu học tiếng nhật, gồm 25 bài sơ cấp trình độ tương đương N5
                    </Text>
                    <Text color='blue.600' fontSize='2xl'>
                        $450
                    </Text>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
                <ButtonGroup spacing='2'>
                    <Button variant='solid' colorScheme='blue'>
                        Xem chi tiết
                    </Button>
                    <Button variant='ghost' colorScheme='blue'>
                        Vào học ngay
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    )
}


export default Course