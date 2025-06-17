import { Box, Button, Link as ChakraLink, Container, Flex, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/api";
import { IconCircle } from "../../components/IconCircle";
import { EMAIL_PATTERN } from "../../constants/email";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectUrl = location.state?.redirectUrl || "/";
  const { handleSubmit, register, formState: { isSubmitting, errors, isValid } } = useForm<FormData>({ defaultValues: { email: "", password: "" } });

  const { mutate: signIn, isPending, isError } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    signIn(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" px={10} textAlign="center" role="main">
        <Heading fontSize="4xl" mb={20} color="whiteAlpha.900">
          <i>Sing</i> in to your account
        </Heading>
        {/* MAIN AUTHENTICATION BOX */}
        <Box
          role="region"
          boxShadow={"0px -6px 5px rgba(254, 254, 254, 0.877)"}
          rounded="lg"
          bg="gray.700"
          p={8}
          position="relative"
        >
          {/* ROUNDED CIRCLE ICON */}
          <IconCircle />
          {/* ERROR MESSAGE FOR API CALL */}
          <Box mb={3} color="red.400" minH={6} role="alert">
            {isError && "Invalid email or password"}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <FormControl id="email" isInvalid={Boolean(errors.email)}>
                {/* EMAIL INPUT */}
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: EMAIL_PATTERN,
                      message: "Invalid email format",
                    },
                  })}
                  autoFocus
                  borderColor="gray.600"
                  color={"gray.200"}
                  _placeholder={{ color: "gray.200" }}
                />
                {/* ERROR MESSAGE EMAIL */}
                <Text fontSize="xs" color="red.300" textAlign={"left"} minH={4} lineHeight={1.4} aria-live="polite">
                  {errors.email && errors.email.message}
                </Text>
              </FormControl>
              {/* PASSWORD */}
              <FormControl id="password" isInvalid={Boolean(errors.password)}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: "gray.200" }}
                />
                {/* ERROR MESSAGE PASSWORD */}
                <Text fontSize="xs" color="red.300" textAlign={"left"} minH={4} lineHeight={1.4} aria-live="polite">
                  {errors.password && errors.password.message}
                </Text>
              </FormControl>
              {/* FORGOT PASSWORD */}
              <ChakraLink
                as={Link}
                to="/password/forgot"
                fontSize="sm"
                _hover={{ textDecoration: "underline" }}
                color={"blue.200"}
              >
                Forgot password?
              </ChakraLink>
              {/* CTA BUTTON */}
              <Button
                my={2}
                isLoading={isPending || isSubmitting}
                isDisabled={isPending || isSubmitting}
                type="submit"
              >
                Sign in
              </Button>
              {/* DON'T HAVE ACCOUNT */}
              <Text align="center" fontSize="sm">
                Don&apos;t have an account?{" "}
                <ChakraLink as={Link} to="/register" _hover={{ textDecoration: "underline" }} color={"blue.200"} fontWeight={600}>
                  Sign ups
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </Box>
      </Container>
    </Flex>
  );
};

export default Login;
