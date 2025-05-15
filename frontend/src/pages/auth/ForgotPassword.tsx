import { Alert, AlertIcon, Box, Button, Link as ChakraLink, Container, Flex, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "../../api/api";

type FormData = {
  email: string;
};

const ForgotPassword = () => {
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors, isValid },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const { mutate: sendPasswordReset, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: sendPasswordResetEmail,
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = async (data: FormData) => {
    sendPasswordReset(data.email);
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" py={12} px={6} textAlign="center">
        <Heading fontSize="4xl" mb={8}>
          Reset your password
        </Heading>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          {isError && (
            <Box mb={3} color="red.400">
              {error?.message || "An error occurred"}
            </Box>
          )}
          <Stack spacing={4}>
            {isSuccess ? (
              <Alert status="success" borderRadius={12}>
                <AlertIcon />
                Email sent! Check your inbox for further instructions.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl id="email" isInvalid={Boolean(errors.email)}>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    autoFocus
                  />
                  {errors.email?.message && (
                    <Text fontSize="sm" color="red.500">
                      {errors.email.message}
                    </Text>
                  )}
                </FormControl>
                <Button
                  my={2}
                  isLoading={isPending || isSubmitting}
                  isDisabled={!isValid}
                  type="submit"
                >
                  Reset Password
                </Button>
              </form>
            )}
            <Text align="center" fontSize="sm" color="text.muted">
              Go back to{" "}
              <ChakraLink as={Link} to="/login" replace>
                Sign in
              </ChakraLink>
              &nbsp;or&nbsp;
              <ChakraLink as={Link} to="/register" replace>
                Sign up
              </ChakraLink>
            </Text>
          </Stack>
        </Box>
      </Container>
    </Flex>
  );
};

export default ForgotPassword;
